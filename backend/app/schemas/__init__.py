"""Pydantic Schemas for DoxFin FastAPI Endpoints (Phases 25, 27 & 28)"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DocumentUploadResponse(BaseModel):
    document_id: str
    job_id: str
    filename: str
    status: str = "processing"
    page_count: Optional[int] = None
    message: str = "Document accepted for asynchronous processing."


class StageStatus(BaseModel):
    name: str
    status: str  # 'COMPLETED', 'IN_PROGRESS', 'PENDING', 'FAILED'
    icon: Optional[str] = None


class StageDetailItem(BaseModel):
    key: str
    label: str
    status: str  # 'COMPLETED', 'IN_PROGRESS', 'PENDING', 'FAILED'
    icon: Optional[str] = None


class DocumentStatusResponse(BaseModel):
    document_id: str
    job_id: Optional[str] = None
    filename: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    progress_percent: int = 0
    current_stage: str = "Pending"
    page_count: int = 0
    stages: Dict[str, str]
    stage_details: Optional[List[StageDetailItem]] = None
    last_updated: Optional[str] = None



class MetricItem(BaseModel):
    metric_name: str
    value: float
    unit: str = "%"
    period: str = "FY2025"
    validation_status: str = "verified"
    source: str = "deterministic_engine"


class DocumentMetricsResponse(BaseModel):
    document_id: str
    metrics: List[MetricItem]
    count: int


class AnomalyItem(BaseModel):
    anomaly_type: str
    severity: str
    message: str
    action_required: Optional[str] = None


class DocumentAnomaliesResponse(BaseModel):
    document_id: str
    anomalies: List[AnomalyItem]
    count: int


class DocumentQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)


class RAGCitation(BaseModel):
    page_number: int
    section: str
    chunk_id: Optional[str] = None
    score: float
    text_snippet: str


class DocumentQueryResponse(BaseModel):
    query: str
    document_id: str
    answer: str
    citations: List[RAGCitation]
    retrieved_chunks_count: int
