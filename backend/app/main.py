import sys
from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure both backend root and repo root are in sys.path
backend_dir = Path(__file__).resolve().parent.parent
repo_root = backend_dir.parent
for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.database.database import init_db, get_db
from app.api.documents import router as documents_router, get_document_status
from sqlalchemy.orm import Session
from fastapi import Depends

app = FastAPI(
    title="DoxFin API",
    description="Privacy-first, Multimodal Financial Document Intelligence Platform",
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

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

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
        "endpoints": {
            "upload_document": "POST /api/v1/documents",
            "document_status": "GET /api/v1/documents/{id}/status",
            "financial_metrics": "GET /api/v1/documents/{id}/metrics",
            "anomalies": "GET /api/v1/documents/{id}/anomalies",
            "rag_query": "POST /api/v1/documents/{id}/query"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
