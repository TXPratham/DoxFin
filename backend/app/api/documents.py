"""
Document Intelligence API Router (Phases 25, 28, 38, 39, 40, 41).
Wraps the full 500-page pipeline with FastAPI endpoints & Enterprise Security:
- POST   /api/v1/documents
- GET    /api/v1/documents/{id}/status
- GET    /api/v1/documents/{id}/metrics
- POST   /api/v1/documents/{id}/metrics/{metric_id}/verify (Phase 39 & 40)
- GET    /api/v1/documents/{id}/anomalies
- POST   /api/v1/documents/{id}/query (Phase 39 & 40)
- GET    /api/v1/documents/{id}/permissions (Phase 39)
- POST   /api/v1/documents/{id}/permissions (Phase 39)
- DELETE /api/v1/documents/{id} (Phase 39, 40, 41)
"""
import shutil
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Query, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Document, FinancialMetric, AnomalyRecord, ProcessingJob, QueryRecord, DocumentAccess, DocumentAccessLevel, User
from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.cache_service import DocumentCacheManager
from app.services.rag_service import RAGService
from app.services.db_service import DatabaseSyncService
from app.services.security_service import SecurityService
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService, get_current_user, require_permission
from app.workers.job_manager import job_manager
from app.schemas import (
    DocumentUploadResponse,
    DocumentStatusResponse,
    StageDetailItem,
    DocumentMetricsResponse,
    MetricItem,
    VerifyMetricRequest,
    VerifyMetricResponse,
    DocumentAnomaliesResponse,
    AnomalyItem,
    DocumentQueryRequest,
    DocumentQueryResponse,
    RAGCitation,
    GrantPermissionRequest,
    DocumentPermissionsResponse,
    PermissionItem
)

router = APIRouter()

# Resolve absolute backend paths
BASE_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_BACKEND_DIR / "uploads"
CACHE_DIR = BASE_BACKEND_DIR / "cache"
VECTOR_STORE_DIR = BASE_BACKEND_DIR / "vector_store"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

pipeline = DoxFin500PagePipeline(
    base_cache_dir=str(CACHE_DIR),
    vector_store_dir=str(VECTOR_STORE_DIR)
)


def _format_stage_details(stages: Dict[str, str], page_count: int = 0) -> List[StageDetailItem]:
    """Generates user-friendly checklist items for progress visualization."""
    stage_definitions = [
        ("file_validation", "File validated"),
        ("pymupdf_fast_pass", f"{page_count or '500'} pages detected" if stages.get("pymupdf_fast_pass") == "COMPLETED" else "Detecting pages"),
        ("page_classification", "Page classification"),
        ("text_extraction", "Text extraction"),
        ("table_extraction", "Table extraction"),
        ("chart_analysis", "Chart analysis"),
        ("financial_calculations", "Financial calculations"),
        ("anomaly_detection", "Anomaly detection"),
        ("rag_indexing", "RAG indexing")
    ]

    details = []
    for key, label in stage_definitions:
        status_val = stages.get(key, "PENDING")
        details.append(StageDetailItem(
            key=key,
            label=label,
            status=status_val
        ))
    return details


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED, summary="Upload and process a financial PDF")
@router.post("/", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED, include_in_schema=False)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    document_id: Optional[str] = Form(None),
    sync: bool = Query(default=False, description="Set True for blocking synchronous execution (testing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an enterprise financial PDF with security validation and ownership assignment.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")

    doc_id = document_id or f"doc_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{doc_id}_{file.filename}"
    saved_path = UPLOADS_DIR / saved_filename

    # Save uploaded file
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Phase 41: Security & File Safety Validation
    is_safe, meta, safety_reason = SecurityService.validate_pdf_safety(str(saved_path))
    if not is_safe:
        # Delete rejected file
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(status_code=400, detail=f"PDF Security Rejection: {safety_reason}")

    # Register document record in database with current_user as owner
    doc_record = db.query(Document).filter(Document.id == doc_id).first()
    if not doc_record:
        doc_record = Document(
            id=doc_id,
            user_id=current_user.id,
            filename=file.filename,
            file_path=str(saved_path),
            file_size_bytes=meta.get("file_size_bytes", 0),
            page_count=meta.get("page_count", 0),
            status="processing"
        )
        db.add(doc_record)
        
        # Grant OWNER permission to uploader
        owner_acl = DocumentAccess(
            document_id=doc_id,
            user_id=current_user.id,
            access_level=DocumentAccessLevel.OWNER.value,
            granted_by_user_id=current_user.id
        )
        db.add(owner_acl)
        db.commit()

    # Log UPLOAD audit event
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuditService.log_event(
        db=db,
        action="UPLOAD",
        user=current_user,
        resource_type="DOCUMENT",
        resource_id=doc_id,
        details={"filename": file.filename, "size_bytes": meta.get("file_size_bytes"), "pages": meta.get("page_count")},
        ip_address=client_ip,
        status="SUCCESS"
    )

    job_id = f"job_{uuid.uuid4().hex[:8]}"

    if sync:
        try:
            result = pipeline.process_document(
                pdf_path=str(saved_path),
                document_id=doc_id
            )
            DatabaseSyncService.sync_pipeline_results(db, result)
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "document_id": doc_id,
                    "job_id": job_id,
                    "filename": file.filename,
                    "status": "completed",
                    "page_count": result.get("page_count", 0),
                    "message": "Document parsed and indexed synchronously."
                }
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Synchronous processing failed: {str(e)}")

    # Asynchronous processing mode
    job_manager.submit_job(
        document_id=doc_id,
        filename=file.filename,
        file_path=str(saved_path),
        job_id=job_id
    )

    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "document_id": doc_id,
            "job_id": job_id,
            "filename": file.filename,
            "status": "processing",
            "page_count": meta.get("page_count"),
            "message": "Document accepted for asynchronous processing. Track progress via /status endpoint."
        }
    )


@router.get("/{document_id}/status", response_model=DocumentStatusResponse, summary="Get processing status and stage checkpoints")
def get_document_status(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("READ"))
):
    """
    Check document ingestion status, progress percentage, and checklist checkpoints.
    """
    live_status = job_manager.get_status(document_id)
    if live_status:
        stages = live_status.get("stages", {})
        page_count = live_status.get("page_count", 0)
        return DocumentStatusResponse(
            document_id=live_status.get("document_id", document_id),
            job_id=live_status.get("job_id"),
            filename=live_status.get("filename", f"{document_id}.pdf"),
            status=live_status.get("status", "processing"),
            progress_percent=live_status.get("progress_percent", 0),
            current_stage=live_status.get("current_stage", "Pending"),
            page_count=page_count,
            stages=stages,
            stage_details=_format_stage_details(stages, page_count),
            last_updated=live_status.get("last_updated")
        )

    doc = db.query(Document).filter(Document.id == document_id).first()
    cache_manager = DocumentCacheManager(document_id=document_id, base_cache_dir=CACHE_DIR)
    state = cache_manager.get_state()

    if not doc and not state.get("stages"):
        raise HTTPException(status_code=404, detail=f"Document or Job '{document_id}' not found.")

    filename = doc.filename if doc else state.get("document_id", document_id)
    page_count = doc.page_count if doc else 0
    status_str = doc.status if doc else "in_progress"
    stages = state.get("stages", {})
    progress_pct = state.get("progress_percent", 100 if status_str == "completed" else 50)
    current_st = state.get("current_stage", "Completed" if status_str == "completed" else "Processing")

    return DocumentStatusResponse(
        document_id=document_id,
        job_id=f"job_{document_id}",
        filename=filename,
        status=status_str,
        progress_percent=progress_pct,
        current_stage=current_st,
        page_count=page_count,
        stages=stages,
        stage_details=_format_stage_details(stages, page_count),
        last_updated=state.get("last_updated")
    )


@router.get("/{document_id}/metrics", response_model=DocumentMetricsResponse, summary="Get verified deterministic financial metrics")
def get_document_metrics(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("READ"))
):
    """
    Retrieve deterministic Python-calculated financial ratios (YoY growth, Net margin, D/E, Current ratio, FCF).
    """
    metrics = db.query(FinancialMetric).filter(FinancialMetric.document_id == document_id).all()
    
    if not metrics:
        cache_manager = DocumentCacheManager(document_id=document_id, base_cache_dir=CACHE_DIR)
        cached_metrics = cache_manager.load_stage_data("validated_metrics")
        if not cached_metrics:
            raise HTTPException(status_code=404, detail=f"No metrics found for document '{document_id}'.")
        
        items = [
            MetricItem(
                metric_name=k,
                value=float(v) if v is not None else 0.0,
                unit="%" if "growth" in k or "margin" in k else "ratio"
            )
            for k, v in cached_metrics.items()
        ]
        return DocumentMetricsResponse(document_id=document_id, metrics=items, count=len(items))

    items = [
        MetricItem(
            id=m.id,
            metric_name=m.metric_name,
            value=m.value,
            unit=m.unit or "%",
            period=m.period or "FY2025",
            validation_status=m.validation_status or "verified",
            source=m.source or "deterministic_engine",
            verified_by=m.verified_by_user_id
        )
        for m in metrics
    ]

    return DocumentMetricsResponse(
        document_id=document_id,
        metrics=items,
        count=len(items)
    )


@router.post("/{document_id}/metrics/{metric_id}/verify", response_model=VerifyMetricResponse, summary="Verify/Sign-off on a financial metric (Reviewer action)")
def verify_financial_metric(
    document_id: str,
    metric_id: str,
    payload: VerifyMetricRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("VERIFY"))
):
    """
    Sign-off or verify a financial metric. Requires VERIFY permission or REVIEWER role.
    """
    metric = db.query(FinancialMetric).filter(
        FinancialMetric.id == metric_id,
        FinancialMetric.document_id == document_id
    ).first()

    if not metric:
        # Fallback search by metric_name if metric_id was passed as metric_name
        metric = db.query(FinancialMetric).filter(
            FinancialMetric.metric_name == metric_id,
            FinancialMetric.document_id == document_id
        ).first()

    if not metric:
        raise HTTPException(status_code=404, detail=f"Metric '{metric_id}' not found for document '{document_id}'.")

    metric.validation_status = payload.status
    metric.verified_by_user_id = current_user.id
    metric.verified_at = datetime.utcnow()
    db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    AuditService.log_event(
        db=db,
        action="VERIFY",
        user=current_user,
        resource_type="METRIC",
        resource_id=f"{document_id}:{metric.metric_name}",
        details={"metric": metric.metric_name, "value": metric.value, "status": payload.status, "note": payload.note},
        ip_address=client_ip,
        status="SUCCESS"
    )

    return VerifyMetricResponse(
        metric_id=metric.id,
        metric_name=metric.metric_name,
        validation_status=metric.validation_status,
        verified_by=current_user.email,
        verified_at=metric.verified_at.isoformat(),
        message="Financial metric verified and recorded in audit log."
    )


@router.get("/{document_id}/anomalies", response_model=DocumentAnomaliesResponse, summary="Get detected accounting anomalies")
def get_document_anomalies(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("READ"))
):
    """
    Retrieve accounting stress and anomaly alerts.
    """
    anomalies = db.query(AnomalyRecord).filter(AnomalyRecord.document_id == document_id).all()

    if not anomalies:
        cache_manager = DocumentCacheManager(document_id=document_id, base_cache_dir=CACHE_DIR)
        cached_anomalies = cache_manager.load_stage_data("anomalies") or []
        items = [
            AnomalyItem(
                anomaly_type=a.get("type", "UNKNOWN"),
                severity=a.get("severity", "MEDIUM"),
                message=a.get("message", ""),
                action_required=a.get("action_required")
            )
            for a in cached_anomalies
        ]
        return DocumentAnomaliesResponse(document_id=document_id, anomalies=items, count=len(items))

    items = [
        AnomalyItem(
            anomaly_type=a.anomaly_type,
            severity=a.severity,
            message=a.message,
            action_required=a.action_required
        )
        for a in anomalies
    ]

    return DocumentAnomaliesResponse(
        document_id=document_id,
        anomalies=items,
        count=len(items)
    )


@router.post("/{document_id}/query", response_model=DocumentQueryResponse, summary="Ask financial questions with sub-second RAG citations")
def query_document(
    document_id: str,
    payload: DocumentQueryRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("ANALYZE"))
):
    """
    Query the document via local FAISS RAG. Requires ANALYZE permissions.
    """
    try:
        rag_res = RAGService.query_by_doc_id(
            query=payload.query,
            doc_id=document_id,
            vector_store_dir=str(VECTOR_STORE_DIR),
            top_k=payload.top_k
        )

        citations = [
            RAGCitation(
                page_number=c["page_number"],
                section=c["section"],
                chunk_id=c.get("chunk_id"),
                score=c["score"],
                text_snippet=c["text_snippet"]
            )
            for c in rag_res.get("citations", [])
        ]

        # Log query and evidence to database
        DatabaseSyncService.record_rag_query(
            db=db,
            document_id=document_id,
            query=payload.query,
            answer=rag_res.get("answer", ""),
            citations=rag_res.get("citations", []),
            user_id=current_user.id
        )

        # Compliance Audit Log
        client_ip = request.client.host if request.client else "127.0.0.1"
        AuditService.log_event(
            db=db,
            action="QUERY",
            user=current_user,
            resource_type="DOCUMENT",
            resource_id=document_id,
            details={"query": payload.query, "citations_count": len(citations)},
            ip_address=client_ip,
            status="SUCCESS"
        )

        return DocumentQueryResponse(
            query=payload.query,
            document_id=document_id,
            answer=rag_res.get("answer", ""),
            citations=citations,
            retrieved_chunks_count=len(citations)
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Document index for '{document_id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query execution failed: {str(e)}")


@router.get("/{document_id}/permissions", response_model=DocumentPermissionsResponse, summary="Get document ACL permissions")
def get_permissions(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("READ"))
):
    """
    Retrieve access control list for document.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    acls = db.query(DocumentAccess).filter(DocumentAccess.document_id == document_id).all()
    owner_email = doc.owner.email if doc.owner else None

    items = [
        PermissionItem(
            user_id=a.user_id,
            user_email=a.user.email if a.user else "Unknown",
            user_name=a.user.full_name if a.user else None,
            access_level=a.access_level,
            granted_at=a.granted_at
        )
        for a in acls
    ]

    return DocumentPermissionsResponse(
        document_id=document_id,
        owner_email=owner_email,
        permissions=items
    )


@router.post("/{document_id}/permissions", summary="Grant or update document permissions (Phase 39)")
def update_permission(
    document_id: str,
    payload: GrantPermissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("MANAGE_PERMISSIONS"))
):
    """
    Grant or update document permissions. Requires OWNER permission or ADMIN role.
    """
    target_user = None
    if payload.target_user_id:
        target_user = db.query(User).filter(User.id == payload.target_user_id).first()
    elif payload.target_email:
        target_user = db.query(User).filter(User.email == payload.target_email).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    acl = AuthService.grant_document_permission(
        db=db,
        granter=current_user,
        document_id=document_id,
        target_user_id=target_user.id,
        access_level=payload.access_level
    )

    return {
        "document_id": document_id,
        "target_user": target_user.email,
        "access_level": acl.access_level,
        "message": f"Successfully granted '{acl.access_level}' to {target_user.email}."
    }


@router.delete("/{document_id}", summary="Securely delete document and all artifacts (Phase 39, 40, 41)")
def delete_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("DELETE"))
):
    """
    Securely delete document from disk, vector store, cache, and database.
    Requires OWNER permission or ADMIN role.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    filename = doc.filename

    # 1. Delete physical files securely
    deleted_files = SecurityService.secure_delete_document_artifacts(
        document_id=document_id,
        uploads_dir=str(UPLOADS_DIR),
        cache_dir=str(CACHE_DIR),
        vector_store_dir=str(VECTOR_STORE_DIR)
    )

    # 2. Delete database records (cascade takes care of relations)
    db.delete(doc)
    db.commit()

    # 3. Log audit event
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuditService.log_event(
        db=db,
        action="DELETE",
        user=current_user,
        resource_type="DOCUMENT",
        resource_id=document_id,
        details={"filename": filename, "deleted_artifacts": deleted_files},
        ip_address=client_ip,
        status="SUCCESS"
    )

    return {
        "document_id": document_id,
        "filename": filename,
        "deleted_artifacts": deleted_files,
        "message": f"Document '{document_id}' and all associated artifacts securely deleted."
    }


@router.get("", summary="List accessible documents for current user")
@router.get("/", include_in_schema=False)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all uploaded documents that the current user has permission to access.
    """
    if current_user.role == "ADMIN":
        docs = db.query(Document).order_by(Document.created_at.desc()).all()
    else:
        # Fetch owned docs or docs with granted ACL != NO_ACCESS
        user_acls = db.query(DocumentAccess).filter(
            DocumentAccess.user_id == current_user.id,
            DocumentAccess.access_level != DocumentAccessLevel.NO_ACCESS.value
        ).all()
        allowed_doc_ids = {a.document_id for a in user_acls}

        docs = db.query(Document).filter(
            (Document.user_id == current_user.id) | (Document.id.in_(allowed_doc_ids))
        ).order_by(Document.created_at.desc()).all()

    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "page_count": d.page_count,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "owner_id": d.user_id
            }
            for d in docs
        ]
    }
