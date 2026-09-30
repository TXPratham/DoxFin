from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a financial PDF or document for ingestion and analysis.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    return {
        "filename": file.filename,
        "status": "received",
        "message": "Document queued for processing",
    }


@router.get("/")
def list_documents():
    """
    List all uploaded/analyzed documents.
    """
    return {"documents": []}
