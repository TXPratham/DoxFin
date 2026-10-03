from collections import Counter
from typing import Dict, Any, List

try:
    from .pdf_inspector import inspect_pdf
    from .page_classifier import classify_page
except ImportError:
    from app.services.pdf_inspector import inspect_pdf
    from app.services.page_classifier import classify_page


def route_document(pdf_path: str) -> Dict[str, List[Dict[str, Any]]]:
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
