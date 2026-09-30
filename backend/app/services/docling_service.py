"""Docling Service for structured document & financial table parsing"""
from typing import Dict, Any, List


class DoclingService:
    @staticmethod
    def extract_tables(pdf_path: str, page_numbers: List[int] = None) -> List[Dict[str, Any]]:
        """
        Extract structured tables from target PDF pages.
        """
        return []
