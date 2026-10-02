"""
DoxFin Asynchronous Processing Job System (Phase 28).
Manages long-running 500-page document processing jobs with non-blocking HTTP 202 Accepted,
live checkpoint tracking, Ray/threaded worker dispatch, and database synchronization.
"""
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import uuid

from app.database.database import SessionLocal
from app.database.models import Document, ProcessingJob
from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.cache_service import DocumentCacheManager
from app.services.db_service import DatabaseSyncService

# Default paths
BASE_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_BACKEND_DIR / "uploads"
CACHE_DIR = BASE_BACKEND_DIR / "cache"
VECTOR_STORE_DIR = BASE_BACKEND_DIR / "vector_store"


class ProcessingJobManager:
    """
    Central coordinator for long-running document processing jobs.
    Maintains in-memory live progress, dispatches background tasks,
    and synchronizes with SQLite/PostgreSQL and local disk cache.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._doc_to_job: Dict[str, str] = {}
        self.pipeline = DoxFin500PagePipeline(
            base_cache_dir=str(CACHE_DIR),
            vector_store_dir=str(VECTOR_STORE_DIR)
        )

    def create_job(self, document_id: str, filename: str, file_path: str, job_id: Optional[str] = None) -> str:
        """Initialize job entry before asynchronous execution."""
        j_id = job_id or f"job_{uuid.uuid4().hex[:8]}"

        job_info = {
            "job_id": j_id,
            "document_id": document_id,
            "filename": filename,
            "file_path": file_path,
            "status": "processing",
            "progress_percent": 5,
            "current_stage": "File validation",
            "page_count": 0,
            "error_message": None,
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
            "stages": {
                "file_validation": "IN_PROGRESS",
                "pymupdf_fast_pass": "PENDING",
                "page_classification": "PENDING",
                "text_extraction": "PENDING",
                "table_extraction": "PENDING",
                "chart_analysis": "PENDING",
                "financial_calculations": "PENDING",
                "anomaly_detection": "PENDING",
                "rag_indexing": "PENDING"
            }
        }

        with self._lock:
            self._jobs[j_id] = job_info
            self._doc_to_job[document_id] = j_id

        # Record initial document and job state in database
        db = SessionLocal()
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if not doc:
                doc = Document(
                    id=document_id,
                    filename=filename,
                    file_path=file_path,
                    status="processing",
                    page_count=0
                )
                db.add(doc)
            else:
                doc.status = "processing"

            # Create or update overall ProcessingJob
            job_rec = db.query(ProcessingJob).filter(
                ProcessingJob.document_id == document_id,
                ProcessingJob.stage == "overall"
            ).first()
            if not job_rec:
                job_rec = ProcessingJob(
                    id=j_id,
                    document_id=document_id,
                    stage="overall",
                    status="IN_PROGRESS",
                    progress_percent=5,
                    current_stage="File validation"
                )
                db.add(job_rec)
            else:
                job_rec.status = "IN_PROGRESS"
                job_rec.progress_percent = 5
                job_rec.current_stage = "File validation"

            db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()

        return j_id

    def submit_job(self, document_id: str, filename: str, file_path: str, job_id: Optional[str] = None) -> str:
        """Register job and trigger background asynchronous execution."""
        j_id = self.create_job(document_id=document_id, filename=filename, file_path=file_path, job_id=job_id)
        
        worker_thread = threading.Thread(
            target=self._run_pipeline_worker,
            args=(j_id, document_id, file_path, filename),
            daemon=True
        )
        worker_thread.start()
    def remove_job(self, document_id: str):
        """Purges job from in-memory tracking when document is deleted."""
        with self._lock:
            job_id = self._doc_to_job.pop(document_id, None)
            if job_id and job_id in self._jobs:
                del self._jobs[job_id]
            if document_id in self._jobs:
                del self._jobs[document_id]

    def _update_stage(self, job_id: str, stage_key: str, pct: int, label: str, status: str):
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]["progress_percent"] = pct
                self._jobs[job_id]["current_stage"] = label
                if stage_key in self._jobs[job_id]["stages"]:
                    self._jobs[job_id]["stages"][stage_key] = status

        # Sync to DB in background safely
        db = SessionLocal()
        try:
            doc_id = self._jobs.get(job_id, {}).get("document_id")
            if doc_id:
                job_rec = db.query(ProcessingJob).filter(
                    ProcessingJob.document_id == doc_id,
                    ProcessingJob.stage == "overall"
                ).first()
                if job_rec:
                    job_rec.progress_percent = pct
                    job_rec.current_stage = label
                    db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

    def _run_pipeline_worker(self, job_id: str, document_id: str, file_path: str, filename: str):
        """Worker executing pipeline with live progress reporting."""
        try:
            def progress_hook(stage_key: str, pct: int, label: str, status: str):
                self._update_stage(job_id, stage_key, pct, label, status)

            result = self.pipeline.process_document(
                pdf_path=file_path,
                document_id=document_id,
                progress_callback=progress_hook
            )

            # Persist to database
            db = SessionLocal()
            try:
                DatabaseSyncService.sync_pipeline_results(db, result)
                doc = db.query(Document).filter(Document.id == document_id).first()
                if doc:
                    doc.status = "completed"
                    doc.page_count = result.get("page_count", 0)
                
                job_rec = db.query(ProcessingJob).filter(
                    ProcessingJob.document_id == document_id,
                    ProcessingJob.stage == "overall"
                ).first()
                if job_rec:
                    job_rec.status = "COMPLETED"
                    job_rec.progress_percent = 100
                    job_rec.current_stage = "Completed"
                    job_rec.completed_at = datetime.utcnow()
                db.commit()
            except Exception as dbe:
                db.rollback()
            finally:
                db.close()

            with self._lock:
                if job_id in self._jobs:
                    self._jobs[job_id]["status"] = "completed"
                    self._jobs[job_id]["progress_percent"] = 100
                    self._jobs[job_id]["current_stage"] = "Completed"
                    self._jobs[job_id]["page_count"] = result.get("page_count", 0)
                    self._jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
                    for k in self._jobs[job_id]["stages"]:
                        self._jobs[job_id]["stages"][k] = "COMPLETED"

        except Exception as e:
            error_msg = str(e)
            with self._lock:
                if job_id in self._jobs:
                    self._jobs[job_id]["status"] = "failed"
                    self._jobs[job_id]["error_message"] = error_msg
                    self._jobs[job_id]["current_stage"] = f"Failed: {error_msg}"

            db = SessionLocal()
            try:
                doc = db.query(Document).filter(Document.id == document_id).first()
                if doc:
                    doc.status = "failed"
                job_rec = db.query(ProcessingJob).filter(
                    ProcessingJob.document_id == document_id,
                    ProcessingJob.stage == "overall"
                ).first()
                if job_rec:
                    job_rec.status = "FAILED"
                    job_rec.error_message = error_msg
                db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()

    def get_status(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Retrieve live status by job_id or document_id."""
        with self._lock:
            # Check direct job_id
            if identifier in self._jobs:
                return dict(self._jobs[identifier])
            # Check document_id mapping
            if identifier in self._doc_to_job:
                j_id = self._doc_to_job[identifier]
                if j_id in self._jobs:
                    return dict(self._jobs[j_id])

        # Fallback to database and cache
        db = SessionLocal()
        try:
            doc = db.query(Document).filter(
                (Document.id == identifier) | (Document.id == identifier.replace("job_", "doc_"))
            ).first()
            if doc:
                cache_manager = DocumentCacheManager(document_id=doc.id, base_cache_dir=CACHE_DIR)
                cache_state = cache_manager.get_state()
                stages = cache_state.get("stages", {})
                
                is_done = doc.status == "completed" or all(v == "COMPLETED" for v in stages.values() if stages)
                pct = 100 if is_done else cache_state.get("progress_percent", 50)
                stage_label = "Completed" if is_done else cache_state.get("current_stage", "Processing")

                return {
                    "job_id": f"job_{doc.id}",
                    "document_id": doc.id,
                    "filename": doc.filename,
                    "status": doc.status,
                    "progress_percent": pct,
                    "current_stage": stage_label,
                    "page_count": doc.page_count,
                    "stages": stages,
                    "last_updated": cache_state.get("last_updated")
                }
        finally:
            db.close()

        return None


# Global Singleton Job Manager
job_manager = ProcessingJobManager()
