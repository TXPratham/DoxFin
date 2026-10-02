import sys
from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import Depends

# Ensure both backend root and repo root are in sys.path
backend_dir = Path(__file__).resolve().parent.parent
repo_root = backend_dir.parent
for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.database.database import init_db, get_db, SessionLocal
from app.services.auth_service import AuthService
from app.api.documents import router as documents_router, get_document_status
from app.api.auth import router as auth_router
from app.api.audit import router as audit_router
from app.api.enterprise import router as enterprise_router


app = FastAPI(
    title="DoxFin Enterprise API",
    description="Privacy-first, Multimodal Financial Document Intelligence Platform with RBAC, Audit Logging, and Zero-Hallucination Arithmetic",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and seed default enterprise demo accounts on startup
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        AuthService.seed_demo_users(db)
    finally:
        db.close()


app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication & RBAC"])
app.include_router(audit_router, prefix="/api/v1/audit-logs", tags=["Audit & Compliance"])
app.include_router(enterprise_router, prefix="/api/v1", tags=["Enterprise & Pilot"])
app.include_router(documents_router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(documents_router, prefix="/documents", include_in_schema=False)



@app.get("/api/v1/jobs/{job_id}", tags=["Jobs"], summary="Get processing status by job_id")
@app.get("/jobs/{job_id}", include_in_schema=False)
def get_job_status_direct(job_id: str, db: Session = Depends(get_db)):
    return get_document_status(document_id=job_id, db=db)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DoxFin Financial Document Intelligence Platform",
        "version": "1.0.0",
        "docs": "http://127.0.0.1:8000/docs",
        "host_architecture": "Centralized Host with Ray & Enterprise GPU / CPU Execution (Zero Client Installation)",
        "endpoints": {
            "auth_login": "POST /api/v1/auth/login",
            "auth_me": "GET /api/v1/auth/me",
            "audit_logs": "GET /api/v1/audit-logs",
            "upload_document": "POST /api/v1/documents",
            "document_status": "GET /api/v1/documents/{id}/status",
            "financial_metrics": "GET /api/v1/documents/{id}/metrics",
            "verify_metric": "POST /api/v1/documents/{id}/metrics/{metric_id}/verify",
            "anomalies": "GET /api/v1/documents/{id}/anomalies",
            "rag_query": "POST /api/v1/documents/{id}/query",
            "document_permissions": "GET/POST /api/v1/documents/{id}/permissions"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
