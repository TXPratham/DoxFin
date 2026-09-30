"""PyMuPDF Service for fast PDF text extraction and page routing"""
import fitz  # PyMuPDF
from typing import List, Dict, Any


class PyMuPDFService:
    @staticmethod
    def extract_text(pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract text page by page with metadata using PyMuPDF.
        """
        doc = fitz.open(pdf_path)
        pages = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            pages.append({
                "page_number": page_num + 1,
                "text": text,
                "has_text": len(text.strip()) > 0,
            })
        doc.close()
        return pages
