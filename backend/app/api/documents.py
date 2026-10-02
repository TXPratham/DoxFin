"""
Document Intelligence API Router (Phase 25).
Wraps the full 500-page pipeline with FastAPI endpoints:
- POST /api/v1/documents
- GET  /api/v1/documents/{id}/status
- GET  /api/v1/documents/{id}/metrics
- GET  /api/v1/documents/{id}/anomalies
- POST /api/v1/documents/{id}/query
"""
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Query, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Document, FinancialMetric, AnomalyRecord, ProcessingJob, QueryRecord
from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.cache_service import DocumentCacheManager
from app.services.rag_service import RAGService
from app.services.db_service import DatabaseSyncService
from app.workers.job_manager import job_manager
from app.schemas import (
    DocumentUploadResponse,
    DocumentStatusResponse,
    StageDetailItem,
    DocumentMetricsResponse,
    MetricItem,
    DocumentAnomaliesResponse,
    AnomalyItem,
    DocumentQueryRequest,
    DocumentQueryResponse,
    RAGCitation
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


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED, summary="Upload and process a financial PDF (Async HTTP 202)")
@router.post("/", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED, include_in_schema=False)
async def upload_document(
    file: UploadFile = File(...),
    document_id: Optional[str] = Form(None),
    sync: bool = Query(default=False, description="Set True for blocking synchronous execution (testing)"),
    db: Session = Depends(get_db)
):
    """
    Upload an enterprise financial PDF (e.g. 500 pages).
    Returns HTTP 202 Accepted immediately with document_id and job_id.
    Processing continues asynchronously in background workers with live checkpoint tracking.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")

    doc_id = document_id or f"doc_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{doc_id}_{file.filename}"
    saved_path = UPLOADS_DIR / saved_filename

    # Save uploaded file
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    job_id = f"job_{uuid.uuid4().hex[:8]}"

    if sync:
        # Blocking synchronous execution mode
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

    # Asynchronous non-blocking execution mode (Phase 28 standard)
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
            "page_count": None,
            "message": "Document accepted for asynchronous processing. Track progress via /status endpoint."
        }
    )


@router.get("/{document_id}/status", response_model=DocumentStatusResponse, summary="Get processing status, progress percentage, and stage checkpoints")
def get_document_status(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Check document ingestion status, progress percentage (e.g. 63%), and checklist checkpoints.
    """
    # Check live job manager status first
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

    # Fallback to database and cache
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


@router.get("/jobs/{job_id}", response_model=DocumentStatusResponse, summary="Get processing status by job_id")
def get_job_status(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Check processing status and checkpoint checklist by job_id.
    """
    return get_document_status(document_id=job_id, db=db)




@router.get("/{document_id}/metrics", response_model=DocumentMetricsResponse, summary="Get verified deterministic financial metrics")
def get_document_metrics(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve deterministic Python-calculated financial ratios (YoY growth, Net margin, D/E, Current ratio, FCF).
    """
    metrics = db.query(FinancialMetric).filter(FinancialMetric.document_id == document_id).all()
    
    # Fallback to cache if DB has not synced
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
            metric_name=m.metric_name,
            value=m.value,
            unit=m.unit or "%",
            period=m.period or "FY2025",
            validation_status=m.validation_status or "verified",
            source=m.source or "deterministic_engine"
        )
        for m in metrics
    ]

    return DocumentMetricsResponse(
        document_id=document_id,
        metrics=items,
        count=len(items)
    )


@router.get("/{document_id}/anomalies", response_model=DocumentAnomaliesResponse, summary="Get detected accounting anomalies")
def get_document_anomalies(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve accounting stress and anomaly alerts (working capital divergence, liquidity warnings, debt strain).
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
    db: Session = Depends(get_db)
):
    """
    Query the document via local FAISS RAG and receive evidence-backed citations with source page numbers.
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
            citations=rag_res.get("citations", [])
        )

        return DocumentQueryResponse(
            query=payload.query,
            document_id=document_id,
            answer=rag_res.get("answer", ""),
            citations=citations,
            retrieved_chunks_count=len(citations)
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Document index for '{document_id}' not found. Please upload and process the document first.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query execution failed: {str(e)}")


@router.get("", summary="List all indexed documents")
@router.get("/", include_in_schema=False)
def list_documents(db: Session = Depends(get_db)):
    """
    List all uploaded and processed financial documents.
    """
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "page_count": d.page_count,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None
            }
            for d in docs
        ]
    }
