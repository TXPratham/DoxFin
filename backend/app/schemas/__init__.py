"""Pydantic Schemas for DoxFin API & Internal Data Flow"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DocumentUploadResponse(BaseModel):
    filename: str
    status: str
    message: str


class FinancialMetricResponse(BaseModel):
    metric_name: str
    value: float
    unit: str = "%"
    status: str = "normal"


class RAGQueryRequest(BaseModel):
    query: str
    document_id: str
    top_k: int = 5


class RAGCitation(BaseModel):
    page_number: int
    section: str
    chunk_id: Optional[str] = None
    score: float
    text_snippet: str


class RAGQueryResponse(BaseModel):
    query: str
    document_id: str
    answer: str
    citations: List[RAGCitation]
    retrieved_chunks_count: int
