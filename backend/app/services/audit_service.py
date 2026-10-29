"""
DoxFin Enterprise Audit Logging Service (Phase 40).
Records immutable compliance events for all financial operations:
- LOGIN / LOGOUT
- UPLOAD (Annual Report PDF)
- QUERY (Natural language RAG questions & answers)
- VERIFY (Analyst/Reviewer financial figure verification)
- DELETE (Document removal)
- PERMISSION_CHANGE (Granting / revoking document ACLs)
- ACCESS_DENIED (Security unauthorized access attempts)
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
import json
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.models import AuditLog, User


def extract_client_ip(request: Any) -> str:
    """Extracts client IP address supporting Cloudflare Tunnel (CF-Connecting-IP) and reverse proxies."""
    if not request:
        return "127.0.0.1"
    headers = getattr(request, "headers", {})
    cf_ip = headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip
    x_forwarded = headers.get("x-forwarded-for")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    client = getattr(request, "client", None)
    return client.host if client else "127.0.0.1"


class AuditService:
    """Central audit logger and query engine for financial compliance."""

    @staticmethod
    def log_event(
        db: Session,
        action: str,
        user: Optional[User] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        user_name: Optional[str] = None,
        document_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Any] = None,
        ip_address: Optional[str] = "127.0.0.1",
        status: str = "SUCCESS"
    ) -> AuditLog:
        """
        Appends an immutable audit log entry into the database.
        """
        uid = user.id if user else user_id
        email = user.email if user else (user_email or "anonymous")
        name = user.full_name if user else (user_name or "Anonymous User")

        target_res_id = resource_id or document_id

        details_str = json.dumps(details, default=str) if isinstance(details, (dict, list)) else (str(details) if details else None)

        log_entry = AuditLog(
            timestamp=datetime.utcnow(),
            document_id=document_id or (resource_id if resource_type == "DOCUMENT" else None),
            user_id=uid,
            user_email=email,
            user_name=name,
            action=action.upper(),
            resource_type=resource_type,
            resource_id=target_res_id,
            details=details_str,
            ip_address=ip_address,
            status=status
        )

        try:
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
        except Exception:
            db.rollback()

        return log_entry

    @staticmethod
    def get_audit_logs(
        db: Session,
        document_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Retrieves filtered audit logs ordered by timestamp descending.
        """
        query = db.query(AuditLog)

        if document_id:
            query = query.filter(
                or_(
                    AuditLog.document_id == document_id,
                    AuditLog.resource_id == document_id,
                    AuditLog.resource_id.like(f"{document_id}%")
                )
            )
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action.upper())
        if status:
            query = query.filter(AuditLog.status == status.upper())

        return query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
