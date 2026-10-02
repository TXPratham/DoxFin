"""
DoxFin Relational Database ORM Models (Phases 24, 38, 39, 40, 41).
Enterprise Multi-User Application Storage with:
- User Identity, Roles (ADMIN, ANALYST, REVIEWER, VIEWER), and Hashed Passwords
- Document Permissions / ACL (OWNER, READ_ANALYZE, READ_VERIFY, READ, NO_ACCESS)
- Verified Financial Metrics & Anomaly Auditing
- Comprehensive Compliance Audit Logs (LOGIN, UPLOAD, QUERY, VERIFY, DELETE, PERMISSION_CHANGE)
"""
from datetime import datetime
import uuid
from typing import List, Optional
from enum import Enum
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    BigInteger,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from app.database.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    REVIEWER = "REVIEWER"
    VIEWER = "VIEWER"


class DocumentAccessLevel(str, Enum):
    OWNER = "OWNER"
    READ_ANALYZE = "READ_ANALYZE"
    READ_VERIFY = "READ_VERIFY"
    READ = "READ"
    NO_ACCESS = "NO_ACCESS"


# ==========================================
# 1. CORE APPLICATION MODELS
# ==========================================

class User(Base):
    """USER: Analyst, reviewer, auditor, admin, or enterprise employee identity."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default=UserRole.ANALYST.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owned_documents = relationship("Document", back_populates="owner", foreign_keys="Document.user_id", cascade="all, delete-orphan")
    permissions = relationship("DocumentAccess", back_populates="user", foreign_keys="DocumentAccess.user_id", cascade="all, delete-orphan")
    queries = relationship("QueryRecord", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Document(Base):
    """DOCUMENT: Uploaded financial document metadata, ownership, and processing status."""
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True)  # e.g. "doc_123"
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(BigInteger, default=0)
    page_count = Column(Integer, default=0)
    sha256_hash = Column(String(64), index=True, nullable=True)
    is_confidential = Column(Boolean, default=False)
    status = Column(String(50), default="uploaded")  # 'uploaded', 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="owned_documents", foreign_keys=[user_id])
    permissions = relationship("DocumentAccess", back_populates="document", cascade="all, delete-orphan")
    pages = relationship("PageRecord", back_populates="document", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")
    financial_metrics = relationship("FinancialMetric", back_populates="document", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyRecord", back_populates="document", cascade="all, delete-orphan")
    queries = relationship("QueryRecord", back_populates="document", cascade="all, delete-orphan")


class DocumentAccess(Base):
    """DOCUMENT_ACCESS / PERMISSION: Granular ACL for financial documents (Phase 39)."""
    __tablename__ = "document_access"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    access_level = Column(String(32), default=DocumentAccessLevel.READ.value)  # OWNER, READ_ANALYZE, READ_VERIFY, READ, NO_ACCESS
    granted_by_user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    granted_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="permissions")
    user = relationship("User", back_populates="permissions", foreign_keys=[user_id])

    __table_args__ = (
        Index("idx_doc_user_access", "document_id", "user_id", unique=True),
    )


class PageRecord(Base):
    """PAGE: Granular page-level classification and content flags."""
    __tablename__ = "pages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False, index=True)
    section_title = Column(String(255), default="General Content")
    financial_score = Column(Integer, default=0)
    has_tables = Column(Boolean, default=False)
    has_charts = Column(Boolean, default=False)
    needs_ocr = Column(Boolean, default=False)
    raw_text_length = Column(Integer, default=0)

    document = relationship("Document", back_populates="pages")

    __table_args__ = (
        Index("idx_doc_page", "document_id", "page_number", unique=True),
    )


class ProcessingJob(Base):
    """PROCESSING_JOB: Stage-by-stage worker checkpoint tracking."""
    __tablename__ = "processing_jobs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(64), nullable=False)  # 'overall', 'pymupdf', 'docling', 'qwen_vl', 'vector_indexing'
    status = Column(String(32), default="PENDING")  # 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    progress_percent = Column(Integer, default=0)
    current_stage = Column(String(128), default="Pending")
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="processing_jobs")


class FinancialMetric(Base):
    """FINANCIAL_METRIC: Deterministically validated financial figures and ratios."""
    __tablename__ = "financial_metrics"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(128), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(32), default="crore")
    currency = Column(String(16), default="INR")
    period = Column(String(32), default="FY2025")
    page_number = Column(Integer, nullable=True)
    validation_status = Column(String(32), default="verified")  # 'verified', 'flagged', 'pending'
    verified_by_user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    source = Column(String(64), default="income_statement")

    document = relationship("Document", back_populates="financial_metrics")


class AnomalyRecord(Base):
    """ANOMALY: Accounting discrepancy and financial stress flags."""
    __tablename__ = "anomalies"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    anomaly_type = Column(String(64), nullable=False)  # 'WORKING_CAPITAL_STRAIN', 'LIQUIDITY_WARNING'
    severity = Column(String(16), default="MEDIUM")  # 'HIGH', 'MEDIUM', 'LOW'
    message = Column(Text, nullable=False)
    action_required = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="anomalies")


class QueryRecord(Base):
    """QUERY: Natural language analyst queries and synthesized answers."""
    __tablename__ = "queries"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    query_text = Column(Text, nullable=False)
    generated_answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="queries")
    user = relationship("User", back_populates="queries")
    evidences = relationship("EvidenceRecord", back_populates="query", cascade="all, delete-orphan")


class EvidenceRecord(Base):
    """EVIDENCE: Traceable source citation links for every query answer."""
    __tablename__ = "evidences"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    query_id = Column(String(64), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    section_title = Column(String(255), default="General Content")
    chunk_id = Column(String(64), nullable=True)
    relevance_score = Column(Float, default=0.0)
    text_snippet = Column(Text, nullable=False)

    query = relationship("QueryRecord", back_populates="evidences")


class AuditLog(Base):
    """AUDIT_LOG: Immutable compliance tracking for financial operations (Phase 40)."""
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    action = Column(String(64), nullable=False, index=True)  # 'LOGIN', 'LOGOUT', 'UPLOAD', 'QUERY', 'VERIFY', 'DELETE', 'PERMISSION_CHANGE', 'ACCESS_DENIED'
    resource_type = Column(String(64), nullable=True)  # 'DOCUMENT', 'METRIC', 'USER', 'SYSTEM'
    resource_id = Column(String(64), nullable=True, index=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    status = Column(String(32), default="SUCCESS")  # 'SUCCESS', 'DENIED', 'FAILURE'

    user = relationship("User", back_populates="audit_logs")
