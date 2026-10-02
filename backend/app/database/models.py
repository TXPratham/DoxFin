"""
DoxFin Relational Database ORM Models (Phase 24).
Structured Application Storage for PostgreSQL (FAISS remains separate for vector search).

Phase 24 Core Tier:
- USER
- DOCUMENT
- PAGE
- PROCESSING_JOB
- FINANCIAL_METRIC
- ANOMALY

Phase 24 Extended Tier:
- DOCUMENT_ACCESS
- QUERY
- EVIDENCE
- AUDIT_LOG
"""
from datetime import datetime
import uuid
from typing import List, Optional
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


# ==========================================
# 1. CORE APPLICATION MODELS
# ==========================================

class User(Base):
    """USER: Analyst, auditor, or enterprise user identity."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    queries = relationship("QueryRecord", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Document(Base):
    """DOCUMENT: Uploaded financial document metadata and status."""
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True)  # e.g. "doc_123"
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(BigInteger, default=0)
    page_count = Column(Integer, default=0)
    sha256_hash = Column(String(64), index=True, nullable=True)
    status = Column(String(50), default="uploaded")  # 'uploaded', 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="documents")
    pages = relationship("PageRecord", back_populates="document", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")
    financial_metrics = relationship("FinancialMetric", back_populates="document", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyRecord", back_populates="document", cascade="all, delete-orphan")
    queries = relationship("QueryRecord", back_populates="document", cascade="all, delete-orphan")


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
    stage = Column(String(64), nullable=False)  # 'pymupdf', 'docling', 'qwen_vl', 'vector_indexing'
    status = Column(String(32), default="PENDING")  # 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
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
    validation_status = Column(String(32), default="verified")  # 'verified', 'flagged'
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


# ==========================================
# 2. EXTENDED AUDIT & ACCESS MODELS
# ==========================================

class DocumentAccess(Base):
    """DOCUMENT_ACCESS: Multi-user access control and permissions."""
    __tablename__ = "document_access"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission = Column(String(32), default="read")  # 'read', 'write', 'admin'
    granted_at = Column(DateTime, default=datetime.utcnow)


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
    """AUDIT_LOG: Immutable compliance tracking for financial queries and exports."""
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(64), nullable=False)  # 'upload', 'recompute', 'rag_query', 'export'
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
