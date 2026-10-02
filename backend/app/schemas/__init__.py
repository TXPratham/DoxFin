"""Pydantic Schemas for DoxFin FastAPI Endpoints (Phase 25)"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    page_count: int
    message: str


class StageProgress(BaseModel):
    stage_name: str
    status: str


class DocumentStatusResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    page_count: int
    stages: Dict[str, str]
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
