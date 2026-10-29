"""
Database Persistence & Synchronization Service (Phase 24).
Stores structured application entities (Users, Documents, Pages, Jobs, Metrics,
Anomalies, Queries, Evidence, Audit Logs) into PostgreSQL.
Keeps FAISS separate for vector search.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

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


class DatabaseSyncService:

    @staticmethod
    def sync_pipeline_results(
        db: Session,
        pipeline_result: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Document:
        """
        Persists full pipeline execution results into relational tables.
        """
        doc_id = pipeline_result["document_id"]
        filename = pipeline_result.get("filename", f"{doc_id}.pdf")
        page_count = pipeline_result.get("page_count", 0)

        # 1. Upsert Document
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            doc = Document(
                id=doc_id,
                user_id=user_id,
                filename=filename,
                file_path=f"uploads/{filename}",
                page_count=page_count,
                status="completed"
            )
            db.add(doc)
        else:
            doc.page_count = page_count
            doc.status = "completed"

        db.flush()

        # 2. Insert Financial Metrics
        metrics = pipeline_result.get("financial_metrics", {})
        # Clear prior metrics for clean state
        db.query(FinancialMetric).filter(FinancialMetric.document_id == doc_id).delete()

        currency_unit = metrics.get("currency_unit") or metrics.get("_currency_unit") or "Cr"

        metric_definitions = [
            ("Consolidated Revenue", metrics.get("consolidated_revenue"), currency_unit),
            ("Reported PAT", metrics.get("net_profit"), currency_unit),
            ("YoY Revenue Growth", metrics.get("revenue_growth_yoy"), "%"),
            ("Operating Margin", metrics.get("net_profit_margin"), "%"),
            ("Debt-to-Equity Ratio", metrics.get("debt_to_equity"), "ratio"),
            ("Current Ratio", metrics.get("current_ratio"), "ratio"),
            ("Free Cash Flow", metrics.get("free_cash_flow"), currency_unit),
        ]

        for name, val, unit in metric_definitions:
            if val is not None:
                fm = FinancialMetric(
                    document_id=doc_id,
                    metric_name=name,
                    value=float(val),
                    unit=unit,
                    validation_status="verified",
                    source="deterministic_financial_engine"
                )
                db.add(fm)

        # 3. Insert Anomalies
        db.query(AnomalyRecord).filter(AnomalyRecord.document_id == doc_id).delete()
        for anom in pipeline_result.get("anomalies", []):
            ar = AnomalyRecord(
                document_id=doc_id,
                anomaly_type=anom.get("type", "UNKNOWN"),
                severity=anom.get("severity", "MEDIUM"),
                message=anom.get("message", ""),
                action_required=anom.get("action_required", "")
            )
            db.add(ar)

        # 4. Insert Processing Jobs from Cache State
        cache_stages = pipeline_result.get("cache", {}).get("stages", {})
        db.query(ProcessingJob).filter(ProcessingJob.document_id == doc_id).delete()
        for stage_name, status in cache_stages.items():
            job = ProcessingJob(
                document_id=doc_id,
                stage=stage_name,
                status=status,
                completed_at=datetime.utcnow() if status == "COMPLETED" else None
            )
            db.add(job)

        # 5. Audit Log
        target_user_id = user_id or doc.user_id
        target_user = db.query(User).filter(User.id == target_user_id).first() if target_user_id else None
        
        AuditService.log_event(
            db=db,
            action="PIPELINE_PROCESSED",
            user=target_user,
            user_id=target_user_id,
            document_id=doc_id,
            resource_type="DOCUMENT",
            resource_id=doc_id,
            details={"filename": doc.filename, "stages_completed": len(cache_stages)},
            status="SUCCESS"
        )

        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def record_rag_query(
        db: Session,
        document_id: str,
        query: str,
        answer: str,
        citations: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> QueryRecord:
        """
        Saves user query, generated answer, and exact evidence source citations to relational DB.
        """
        q_record = QueryRecord(
            document_id=document_id,
            user_id=user_id,
            query_text=query,
            generated_answer=answer
        )
        db.add(q_record)
        db.flush()

        for c in citations:
            ev = EvidenceRecord(
                query_id=q_record.id,
                page_number=c.get("page_number", 1),
                section_title=c.get("section", "General Content"),
                chunk_id=c.get("chunk_id", ""),
                relevance_score=c.get("score", 0.0),
                text_snippet=c.get("text_snippet", "")
            )
            db.add(ev)

        # Audit Log
        audit = AuditLog(
            document_id=document_id,
            user_id=user_id,
            action="rag_query"
        )
        db.add(audit)

        db.commit()
        db.refresh(q_record)
        return q_record
