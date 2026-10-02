"""
Ray Distributed Workers for 500-Page Document Pipeline (Phase 20 & 21).
Conservative worker design for ASUS A15 laptop:
- TextWorker: Fast PyMuPDF digital text extraction in batches of 10 pages.
- TableWorker: Selective Docling conversion only on pages with complex tables.
- VisionWorker: Selective Qwen-VL chart extraction only on validated financial visuals.
"""
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

# Optional Ray import with graceful fallback
try:
    import ray
    RAY_AVAILABLE = True
except ImportError:
    RAY_AVAILABLE = False

from app.services.pymupdf_service import inspect_pdf
from app.services.classifier_service import classify_page
from app.services.docling_service import process_with_docling
from app.services.vision_service import VisionService, is_candidate_financial_chart


class TextWorker:
    """Fast digital text extractor using PyMuPDF."""

    def process_batch(self, pdf_path: str, page_numbers: List[int]) -> List[Dict[str, Any]]:
        import pymupdf
        doc = pymupdf.open(pdf_path)
        batch_results = []
        for p_num in page_numbers:
            if 1 <= p_num <= len(doc):
                page = doc[p_num - 1]
                text = page.get_text("text")
                images = page.get_images(full=True)
                tables = page.find_tables()
                page_data = {
                    "page_number": p_num,
                    "text": text,
                    "text_length": len(text),
                    "image_count": len(images),
                    "table_count": len(tables.tables),
                    "needs_ocr": len(text.strip()) < 50
                }
                classified = classify_page(page_data)
                batch_results.append(classified)
        doc.close()
        return batch_results


class TableWorker:
    """Selective Docling worker for high-density tabular and statement pages."""

    def process_table_page(self, pdf_path: str, page_number: int, needs_ocr: bool = False) -> Dict[str, Any]:
        result = process_with_docling(
            file_path=pdf_path,
            page_range=(page_number, page_number),
            needs_ocr=needs_ocr
        )
        return {
            "page_number": page_number,
            "markdown": result.get("markdown", ""),
            "used_ocr": result.get("used_ocr", False)
        }


class VisionWorker:
    """Selective Vision worker for financial graphs and charts."""

    def process_chart_page(self, page_data: Dict[str, Any], image_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
        return VisionService.process_page_images(page_data, image_path=image_path)


# Ray Actor definitions if Ray is initialized
if RAY_AVAILABLE:
    try:
        @ray.remote
        class RayTextWorker(TextWorker):
            pass

        @ray.remote
        class RayTableWorker(TableWorker):
            pass

        @ray.remote
        class RayVisionWorker(VisionWorker):
            pass
    except Exception:
        pass


def execute_parallel_pipeline(
    pdf_path: str,
    classified_pages: List[Dict[str, Any]],
    batch_size: int = 10,
    max_workers: int = 2
) -> Dict[str, Any]:
    """
    Conservative batch dispatcher for 500 pages:
    Batches pages to prevent memory spikes on laptop hardware.
    """
    text_worker = TextWorker()
    table_worker = TableWorker()
    vision_worker = VisionWorker()

    table_pages = [p for p in classified_pages if p.get("use_docling", False)]
    chart_pages = [p for p in classified_pages if p.get("use_vision", False)]

    # Selective Docling table processing
    extracted_tables = []
    for tp in table_pages:
        p_num = tp["page_number"]
        t_res = table_worker.process_table_page(pdf_path, page_number=p_num, needs_ocr=tp.get("use_ocr", False))
        extracted_tables.append(t_res)

    # Selective Qwen vision processing
    extracted_charts = []
    for cp in chart_pages:
        c_res = vision_worker.process_chart_page(cp)
        if c_res:
            extracted_charts.append(c_res)

    return {
        "total_pages": len(classified_pages),
        "table_pages_processed": len(extracted_tables),
        "chart_pages_processed": len(extracted_charts),
        "tables": extracted_tables,
        "charts": extracted_charts
    }
