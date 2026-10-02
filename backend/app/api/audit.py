"""
DoxFin Audit & Governance API Router (Phase 40).
Provides:
- GET /api/v1/audit-logs (Filterable financial compliance audit log)
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.services.audit_service import AuditService
from app.services.auth_service import get_current_user
from app.schemas import AuditLogResponse, AuditLogItem

router = APIRouter()


@router.get("", response_model=AuditLogResponse, summary="Query compliance audit trail")
@router.get("/", include_in_schema=False)
def get_audit_trail(
    document_id: Optional[str] = Query(None, description="Filter by Document ID"),
    user_id: Optional[str] = Query(None, description="Filter by User ID"),
    action: Optional[str] = Query(None, description="Filter by Action (e.g. UPLOAD, QUERY, VERIFY, DELETE)"),
    status: Optional[str] = Query(None, description="Filter by Status (SUCCESS, DENIED, FAILURE)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Query immutable compliance audit logs with filtering by document, user, and action.
    """
    logs = AuditService.get_audit_logs(
        db=db,
        document_id=document_id,
        user_id=user_id,
        action=action,
        status=status,
        limit=limit,
        offset=offset
    )

    items = [
        AuditLogItem(
            id=log.id,
            timestamp=log.timestamp,
            user_email=log.user_email,
            user_name=log.user_name,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            details=log.details,
            ip_address=log.ip_address,
            status=log.status
        )
        for log in logs
    ]

    return AuditLogResponse(
        logs=items,
        total_count=len(items)
    )
