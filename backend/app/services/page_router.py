from collections import Counter
from pathlib import Path
import time
from typing import Dict, Any, List, Optional, Tuple, Callable
import pymupdf

try:
    from .pdf_inspector import inspect_pdf
    from .page_classifier import classify_page
except ImportError:
    from app.services.pdf_inspector import inspect_pdf
    from app.services.page_classifier import classify_page


def timed_stage(name: str, func: Callable, *args, **kwargs) -> Tuple[Any, float]:
    """Wraps pipeline stage with high-precision performance timing."""
    start = time.perf_counter()
    result = func(*args, **kwargs)
    elapsed = time.perf_counter() - start
    print(f"[PERFORMANCE] {name}: {elapsed:.2f}s")
    return result, elapsed


def route_document(pdf_path: str) -> Dict[str, List[Dict[str, Any]]]:
    """Fast-pass inspection and heuristic page classification."""
    pages = inspect_pdf(pdf_path)

    classified_pages = [
        classify_page(page)
        for page in pages
    ]

    routes = {
        "text": [],
        "financial_table": [],
        "financial_chart": [],
        "irrelevant": [],
    }

    for page in classified_pages:
        routes[page["route"]].append(page)

    counts = Counter(
        page["route"]
        for page in classified_pages
    )

    print("\n========== DOXFIN PAGE ROUTER ==========")
    print(f"Total pages       : {len(classified_pages)}")
    print(f"Text pages        : {counts.get('text', 0)}")
    print(f"Financial tables  : {counts.get('financial_table', 0)}")
    print(f"Financial charts  : {counts.get('financial_chart', 0)}")
    print(f"Skipped pages     : {counts.get('irrelevant', 0)}")
    print("========================================\n")

    return routes


def create_selected_pages_pdf(
    source_pdf: str,
    page_indexes: List[int],
    output_pdf: str,
) -> Dict[int, int]:
    """
    Creates a compact temporary PDF containing only selected pages (e.g. financial tables).
    Returns page_mapping: {temp_pdf_index: original_1_indexed_page_number}
    """
    source = pymupdf.open(source_pdf)
    selected = pymupdf.open()
    page_mapping = {}

    for temp_idx, page_index in enumerate(page_indexes):
        selected.insert_pdf(
            source,
            from_page=page_index,
            to_page=page_index
        )
        page_mapping[temp_idx] = page_index + 1  # 1-indexed original page for provenance

    Path(output_pdf).parent.mkdir(
        parents=True,
        exist_ok=True
    )

    selected.save(output_pdf)
    selected.close()
    source.close()

    return page_mapping


def render_page(pdf_path: str, page_index: int, output_path: str) -> str:
    """Renders a single selected page to PNG for targeted multimodal visual inspection."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    page = doc[page_index]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5))
    pix.save(output_path)
    doc.close()
    return output_path


def merge_selective_results(
    text_results: List[Dict[str, Any]],
    table_results: List[Dict[str, Any]],
    chart_results: List[Dict[str, Any]],
    skipped_pages: List[int]
) -> Dict[str, Any]:
    """
    Normalizes all processing branches into unified document structure
    with exact provenance (source, type, original page).
    """
    return {
        "text_pages": text_results,
        "table_pages": table_results,
        "chart_pages": chart_results,
        "skipped_pages": skipped_pages
    }
