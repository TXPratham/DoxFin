"""
Pydantic Schemas for DoxFin FastAPI Endpoints (Phases 25, 27, 28, 38, 39, 40, 41).
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


# ==========================================
# 1. AUTH & USER SCHEMAS (Phase 38)
# ==========================================

class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "ANALYST"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None


# ==========================================
# 2. DOCUMENT PERMISSION SCHEMAS (Phase 39)
# ==========================================

class GrantPermissionRequest(BaseModel):
    target_user_id: Optional[str] = None
    target_email: Optional[str] = None
    access_level: str = "READ_ANALYZE"  # OWNER, READ_ANALYZE, READ_VERIFY, READ, NO_ACCESS


class PermissionItem(BaseModel):
    user_id: str
    user_email: str
    user_name: Optional[str] = None
    access_level: str
    granted_at: Optional[datetime] = None


class DocumentPermissionsResponse(BaseModel):
    document_id: str
    owner_email: Optional[str] = None
    permissions: List[PermissionItem]


# ==========================================
# 3. METRIC VERIFICATION SCHEMAS (Phase 39 & 40)
# ==========================================

class VerifyMetricRequest(BaseModel):
    status: str = "verified"  # 'verified', 'flagged'
    note: Optional[str] = None


class VerifyMetricResponse(BaseModel):
    metric_id: str
    metric_name: str
    validation_status: str
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    message: str = "Financial metric verification status recorded."


# ==========================================
# 4. AUDIT LOG SCHEMAS (Phase 40)
# ==========================================

class AuditLogItem(BaseModel):
    id: str
    timestamp: datetime
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    status: str


class AuditLogResponse(BaseModel):
    logs: List[AuditLogItem]
    total_count: int


# ==========================================
# 5. DOCUMENT PROCESSING & STATUS SCHEMAS
# ==========================================

class DocumentUploadResponse(BaseModel):
    document_id: str
    job_id: str
    filename: str
    status: str = "processing"
    page_count: Optional[int] = None
    message: str = "Document accepted for asynchronous processing."


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
    id: Optional[str] = None
    metric_name: str
    value: float
    unit: str = "%"
    period: str = "FY2025"
    validation_status: str = "verified"
    source: str = "deterministic_engine"
    verified_by: Optional[str] = None


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
