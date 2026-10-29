"""
DoxFin Enterprise Authentication API Router (Phase 38 & 41).
Provides:
- POST /api/v1/auth/login (JWT Bearer token generation)
- POST /api/v1/auth/register (Create enterprise user)
- GET  /api/v1/auth/me (Current user session & role)
- GET  /api/v1/auth/users (List team members)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User, UserRole
from app.services.security_service import SecurityService
from app.services.auth_service import AuthService, get_current_user
from app.services.audit_service import AuditService, extract_client_ip
from app.schemas import (
    UserLoginRequest,
    UserRegisterRequest,
    TokenResponse,
    UserResponse
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Enterprise user authentication")
def login(payload: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate employee credentials and return JWT bearer token.
    """
    user = AuthService.authenticate_user(db, payload.email, payload.password)
    client_ip = extract_client_ip(request)

    if not user:
        AuditService.log_event(
            db=db,
            action="LOGIN",
            user_email=payload.email,
            resource_type="USER",
            details="Failed login attempt: Invalid credentials",
            ip_address=client_ip,
            status="FAILURE"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Issue JWT token
    token = SecurityService.create_jwt_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    })

    AuditService.log_event(
        db=db,
        action="LOGIN",
        user=user,
        resource_type="USER",
        resource_id=user.id,
        details={"role": user.role},
        ip_address=client_ip,
        status="SUCCESS"
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register enterprise employee")
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new employee identity.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Email '{payload.email}' is already registered.")

    user = User(
        email=payload.email,
        full_name=payload.full_name or payload.email.split("@")[0].capitalize(),
        hashed_password=SecurityService.hash_password(payload.password),
        role=payload.role.upper() if payload.role else UserRole.ANALYST.value,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    AuditService.log_event(
        db=db,
        action="REGISTER",
        user=user,
        resource_type="USER",
        resource_id=user.id,
        details={"role": user.role}
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )


@router.get("/me", response_model=UserResponse, summary="Get active session details")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve active session and role permissions.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.get("/users", response_model=List[UserResponse], summary="List enterprise team members")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    List all registered employees in DoxFin.
    """
    users = db.query(User).order_by(User.created_at.asc()).all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at
        )
        for u in users
    ]
