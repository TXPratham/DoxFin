from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.documents import router as documents_router

app = FastAPI(
    title="DoxFin API",
    description="Privacy-first, Multimodal Financial Document Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router, prefix="/api/v1/documents", tags=["Documents"])


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DoxFin Financial Document Intelligence Platform",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
