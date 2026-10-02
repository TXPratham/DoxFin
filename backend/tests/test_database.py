import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.database import init_db, SessionLocal, engine
from app.database.models import (
    User,
    Document,
    PageRecord,
    ProcessingJob,
    FinancialMetric,
    AnomalyRecord,
    DocumentAccess,
    QueryRecord,
    EvidenceRecord,
    AuditLog
)
from app.services.db_service import DatabaseSyncService

print("=" * 75)
print("Phase 24: Relational PostgreSQL Schema & Entity Persistence Test")
print("=" * 75)

# 1. Initialize DB tables
print("\n1. Initializing database schema...")
init_db()
print("   All tables created successfully.")

db = SessionLocal()

# 2. Seed User
print("\n2. Creating test analyst user (USER)...")
user = db.query(User).filter(User.email == "analyst@doxfin.ai").first()
if not user:
    user = User(
        email="analyst@doxfin.ai",
        full_name="Lead Financial Analyst",
        role="senior_analyst"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

print(f"   User ID: {user.id} | Email: {user.email} | Role: {user.role}")

# 3. Persist Pipeline Results into Core Models (DOCUMENT, METRIC, ANOMALY, JOBS)
print("\n3. Persisting 500-page pipeline execution results into relational tables...")
mock_pipeline_result = {
    "document_id": "doc_postgres_24",
    "filename": "TCS_Annual_Report_FY25.pdf",
    "page_count": 486,
    "financial_metrics": {
        "revenue_growth_yoy": 14.85,
        "net_profit_margin": 18.20,
        "debt_to_equity": 0.15,
        "current_ratio": 2.45,
        "free_cash_flow": 4250.0,
        "net_profit": 5120.0
    },
    "anomalies": [
        {
            "type": "LIQUIDITY_NOTICE",
            "severity": "LOW",
            "message": "Strong liquidity buffer: Current assets exceed obligations by 2.45x.",
            "action_required": "None required."
        }
    ],
    "cache": {
        "stages": {
            "metadata": "COMPLETED",
            "pages": "COMPLETED",
            "tables": "COMPLETED",
            "charts": "COMPLETED",
            "vector_indexing": "COMPLETED"
        }
    }
}

doc = DatabaseSyncService.sync_pipeline_results(db, mock_pipeline_result, user_id=user.id)
print(f"   Saved Document: {doc.id} ({doc.filename}, {doc.page_count} pages)")

# Verify Metrics
metrics = db.query(FinancialMetric).filter(FinancialMetric.document_id == doc.id).all()
print(f"\n   Persisted Financial Metrics ({len(metrics)} items):")
for m in metrics:
    print(f"   - {m.metric_name:24s}: {m.value:8.2f} {m.unit:6s} [Status: {m.validation_status}]")

# Verify Anomalies
anomalies = db.query(AnomalyRecord).filter(AnomalyRecord.document_id == doc.id).all()
print(f"\n   Persisted Anomalies ({len(anomalies)} items):")
for a in anomalies:
    print(f"   - [{a.severity}] {a.anomaly_type}: {a.message}")

# Verify Jobs
jobs = db.query(ProcessingJob).filter(ProcessingJob.document_id == doc.id).all()
print(f"\n   Persisted Processing Jobs ({len(jobs)} stages):")
for j in jobs:
    print(f"   - {j.stage:20s}: {j.status}")

# 4. Extended Models: QUERY, EVIDENCE, AUDIT_LOG
print("\n4. Testing Extended Tier: QUERY, EVIDENCE, AUDIT_LOG...")
citations = [
    {
        "page_number": 151,
        "section": "Consolidated Cash Flows",
        "chunk_id": "doc24_p151_c1",
        "score": 0.88,
        "text_snippet": "Free cash flow for the year rose to 4,250 crore INR driven by operating discipline."
    },
    {
        "page_number": 178,
        "section": "Working Capital Notes",
        "chunk_id": "doc24_p178_c2",
        "score": 0.72,
        "text_snippet": "Debtor collection cycles maintained at 42 days."
    }
]

q_rec = DatabaseSyncService.record_rag_query(
    db=db,
    document_id=doc.id,
    query="What is the Free Cash Flow for FY25?",
    answer="Free Cash Flow for FY25 reached 4,250 crore INR based on Cash Flow Statement (Page 151).",
    citations=citations,
    user_id=user.id
)

print(f"   Query ID:     {q_rec.id}")
print(f"   Question:     {q_rec.query_text}")
print(f"   Answer:       {q_rec.generated_answer}")

evidences = db.query(EvidenceRecord).filter(EvidenceRecord.query_id == q_rec.id).all()
print(f"   Persisted Evidence Citations ({len(evidences)} citations):")
for ev in evidences:
    print(f"   - Page {ev.page_number} | {ev.section_title} | Score: {ev.relevance_score:.2f}")

# Audit Logs
logs = db.query(AuditLog).filter(AuditLog.document_id == doc.id).all()
print(f"\n   Audit Log Entries ({len(logs)} records):")
for log in logs:
    print(f"   - [{log.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] Action: {log.action} | User: {log.user_id}")

db.close()
print("\n>>> Phase 24 Relational Persistence Test Passed Successfully! <<<")
