"""
Multi-Stage Pipeline Caching Service (Phase 23).
Provides per-document granular disk caching for every expensive computation:
- metadata.json
- pages.json (PyMuPDF inspection + classification)
- extracted_text.json (chunks + text)
- tables.json (Docling extraction)
- charts.json (Qwen3-VL chart extraction)
- validated_metrics.json (Normalized accounting figures)
- anomalies.json (Anomaly detection results)
- processing_state.json (Stage checkpoints and resumption tracking)

Allows instantaneous pipeline resumption from the exact point of failure without
re-processing earlier 500-page stages.
"""
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Union, List


STAGE_FILE_MAPPING = {
    "metadata": "metadata.json",
    "pages": "pages.json",
    "extracted_text": "extracted_text.json",
    "tables": "tables.json",
    "charts": "charts.json",
    "validated_metrics": "validated_metrics.json",
    "anomalies": "anomalies.json",
    "processing_state": "processing_state.json"
}


class DocumentCacheManager:
    """
    Manages stage caching, checkpoint persistence, and restart capabilities for a document.
    """

    def __init__(self, document_id: str, base_cache_dir: Union[str, Path] = "cache"):
        self.document_id = document_id
        self.doc_cache_dir = Path(base_cache_dir) / document_id
        self.doc_cache_dir.mkdir(parents=True, exist_ok=True)
        self.state_file = self.doc_cache_dir / "processing_state.json"
        self._init_state()

    def _init_state(self) -> None:
        if not self.state_file.exists():
            initial_state = {
                "document_id": self.document_id,
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "stages": {
                    "file_validation": "PENDING",
                    "pymupdf_inspection": "PENDING",
                    "page_classification": "PENDING",
                    "docling_tables": "PENDING",
                    "qwen_charts": "PENDING",
                    "normalization_validation": "PENDING",
                    "financial_engine": "PENDING",
                    "anomaly_detection": "PENDING",
                    "vector_indexing": "PENDING"
                }
            }
            self._save_json(self.state_file, initial_state)

    def _save_json(self, file_path: Path, data: Any) -> None:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _load_json(self, file_path: Path) -> Optional[Any]:
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_state(self) -> Dict[str, Any]:
        state = self._load_json(self.state_file)
        return state if state else {}

    def update_stage_status(self, stage: str, status: str, error_msg: Optional[str] = None) -> None:
        """
        Status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
        """
        state = self.get_state()
        if "stages" not in state:
            state["stages"] = {}

        state["stages"][stage] = status
        state["last_updated"] = datetime.now().isoformat()
        if error_msg:
            state[f"error_{stage}"] = error_msg
        elif f"error_{stage}" in state:
            del state[f"error_{stage}"]

        self._save_json(self.state_file, state)

    def is_stage_completed(self, stage: str) -> bool:
        state = self.get_state()
        return state.get("stages", {}).get(stage) == "COMPLETED"

    def save_stage_data(self, stage_key: str, data: Any) -> Path:
        filename = STAGE_FILE_MAPPING.get(stage_key, f"{stage_key}.json")
        target_path = self.doc_cache_dir / filename
        self._save_json(target_path, data)
        self.update_stage_status(stage_key, "COMPLETED")
        return target_path

    def load_stage_data(self, stage_key: str) -> Optional[Any]:
        filename = STAGE_FILE_MAPPING.get(stage_key, f"{stage_key}.json")
        target_path = self.doc_cache_dir / filename
        return self._load_json(target_path)

    def get_cache_summary(self) -> Dict[str, Any]:
        state = self.get_state()
        cached_files = [f.name for f in self.doc_cache_dir.glob("*.json")]
        return {
            "document_id": self.document_id,
            "cache_dir": str(self.doc_cache_dir),
            "cached_files": cached_files,
            "stages": state.get("stages", {})
        }
