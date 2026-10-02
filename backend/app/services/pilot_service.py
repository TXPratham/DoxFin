"""
DoxFin Company Pilot Monitoring & Issue Tracking Service (Phase 51).
Aggregates real-user feedback, extraction anomalies, unit mistakes,
RAG inaccuracies, and hardware stability metrics across 2-4 week pilot runs.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import PilotFeedback, Document, User


class PilotService:
    VALID_CATEGORIES = {
        "EXTRACTION_ERROR": "Extraction Error",
        "WRONG_TABLE": "Wrong Table Recognition",
        "INCORRECT_UNITS": "Incorrect Units / Normalization",
        "RAG_MISTAKE": "RAG Retrieval Mistake",
        "MISSING_EVIDENCE": "Missing Source Evidence",
        "PROCESSING_CRASH": "Processing Pipeline Crash",
        "HARDWARE_RAM_GPU": "GPU / RAM Strain",
        "UI_PROBLEM": "UI / UX Issue",
        "GENERAL_FEEDBACK": "User Feedback & Suggestions"
    }

    def record_feedback(
        self,
        db: Session,
        title: str,
        description: str,
        category: str = "GENERAL_FEEDBACK",
        severity: str = "MEDIUM",
        document_id: Optional[str] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        page_number: Optional[int] = None,
        expected_value: Optional[str] = None,
        actual_value: Optional[str] = None
    ) -> PilotFeedback:
        category_clean = category.upper()
        if category_clean not in self.VALID_CATEGORIES:
            category_clean = "GENERAL_FEEDBACK"

        feedback = PilotFeedback(
            title=title,
            description=description,
            category=category_clean,
            severity=severity.upper(),
            document_id=document_id,
            user_id=user_id,
            user_email=user_email,
            page_number=page_number,
            expected_value=expected_value,
            actual_value=actual_value,
            status="OPEN"
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    def list_issues(
        self,
        db: Session,
        category: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50
    ) -> List[PilotFeedback]:
        query = db.query(PilotFeedback)
        if category:
            query = query.filter(PilotFeedback.category == category.upper())
        if status:
            query = query.filter(PilotFeedback.status == status.upper())
        if severity:
            query = query.filter(PilotFeedback.severity == severity.upper())
        return query.order_by(PilotFeedback.created_at.desc()).limit(limit).all()

    def update_issue_status(
        self,
        db: Session,
        issue_id: str,
        status: str,
        resolution_notes: Optional[str] = None
    ) -> Optional[PilotFeedback]:
        issue = db.query(PilotFeedback).filter(PilotFeedback.id == issue_id).first()
        if not issue:
            return None
        issue.status = status.upper()
        if resolution_notes:
            issue.resolution_notes = resolution_notes
        db.commit()
        db.refresh(issue)
        return issue

    def get_pilot_readiness_summary(self, db: Session) -> Dict[str, Any]:
        """
        Calculates pilot stability scorecard:
        - Total issues logged
        - Open vs Resolved breakdown
        - Category distribution
        - Pilot Readiness Score (0-100%)
        """
        total_issues = db.query(func.count(PilotFeedback.id)).scalar() or 0
        open_issues = db.query(func.count(PilotFeedback.id)).filter(PilotFeedback.status == "OPEN").scalar() or 0
        critical_issues = db.query(func.count(PilotFeedback.id)).filter(
            PilotFeedback.severity == "CRITICAL", PilotFeedback.status == "OPEN"
        ).scalar() or 0

        # Category Breakdown
        cat_counts = (
            db.query(PilotFeedback.category, func.count(PilotFeedback.id))
            .group_by(PilotFeedback.category)
            .all()
        )
        category_breakdown = {cat: count for cat, count in cat_counts}

        # Calculate Readiness Score
        if total_issues == 0:
            readiness_score = 100.0
        else:
            resolved_ratio = (total_issues - open_issues) / total_issues
            penalty = critical_issues * 20.0
            readiness_score = max(0.0, min(100.0, (resolved_ratio * 100.0) - penalty))

        return {
            "total_issues_logged": total_issues,
            "open_issues": open_issues,
            "critical_blockers": critical_issues,
            "category_breakdown": category_breakdown,
            "pilot_readiness_score_pct": round(readiness_score, 1),
            "production_gate_status": "READY" if (critical_issues == 0 and open_issues <= 2) else "PILOT_STABILIZING"
        }


pilot_service = PilotService()
