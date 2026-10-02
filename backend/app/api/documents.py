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
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Document, FinancialMetric, AnomalyRecord, ProcessingJob, QueryRecord
from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.cache_service import DocumentCacheManager
from app.services.rag_service import RAGService
from app.services.db_service import DatabaseSyncService
from app.schemas import (
    DocumentUploadResponse,
    DocumentStatusResponse,
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


@router.post("", response_model=DocumentUploadResponse, summary="Upload and process a financial PDF")
@router.post("/", response_model=DocumentUploadResponse, include_in_schema=False)
async def upload_document(
    file: UploadFile = File(...),
    document_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload an enterprise financial PDF (e.g. 500 pages) and execute the selective processing pipeline.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")

    doc_id = document_id or f"doc_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{doc_id}_{file.filename}"
    saved_path = UPLOADS_DIR / saved_filename

    # Save uploaded file
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run optimized pipeline
        result = pipeline.process_document(
            pdf_path=str(saved_path),
            document_id=doc_id
        )

        # Sync to PostgreSQL
        DatabaseSyncService.sync_pipeline_results(db, result)

        return DocumentUploadResponse(
            document_id=doc_id,
            filename=file.filename,
            status="completed",
            page_count=result.get("page_count", 0),
            message="Document parsed, metrics computed, and indexed into FAISS successfully."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")


@router.get("/{document_id}/status", response_model=DocumentStatusResponse, summary="Get processing status and stage checkpoints")
def get_document_status(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Check document ingestion status and stage-by-stage progress (PyMuPDF, Docling, Qwen, FAISS).
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    cache_manager = DocumentCacheManager(document_id=document_id, base_cache_dir=CACHE_DIR)
    state = cache_manager.get_state()

    if not doc and not state.get("stages"):
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    filename = doc.filename if doc else state.get("document_id", document_id)
    page_count = doc.page_count if doc else 0
    status = doc.status if doc else "in_progress"

    return DocumentStatusResponse(
        document_id=document_id,
        filename=filename,
        status=status,
        page_count=page_count,
        stages=state.get("stages", {}),
        last_updated=state.get("last_updated")
    )


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
