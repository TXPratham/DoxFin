import sys
import os
from pathlib import Path

# Add project root and backend to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.app.services.page_router import route_document

# Locate available sample/annual report PDF in backend/uploads or root
sample_candidates = [
    PROJECT_ROOT / "backend" / "uploads" / "doc_1790939796700_Stellantis-NV-20251231-Annual-Report.pdf",
    PROJECT_ROOT / "backend" / "uploads" / "doc_1791005080872_annual-report-2025-2026.pdf",
    PROJECT_ROOT / "backend" / "uploads" / "doc_1790975773082_Sample-Financial-Statements-1.pdf",
    PROJECT_ROOT / "test.pdf"
]

pdf_path = None
for cand in sample_candidates:
    if cand.exists():
        pdf_path = str(cand)
        break

if not pdf_path:
    raise FileNotFoundError("No PDF file found for testing router.")

print(f"Testing Page Router on: {pdf_path}")
routes = route_document(pdf_path)

print("\nTABLE PAGES (Docling Route):")
print([
    page["page"]
    for page in routes["financial_table"]
])

print("\nCHART PAGES (Qwen3-VL Route):")
print([
    page["page"]
    for page in routes["financial_chart"]
])

print("\nSKIPPED PAGES (Irrelevant/Decorative):")
print([
    page["page"]
    for page in routes["irrelevant"]
])

print("\nTEXT PAGES (PyMuPDF Route):")
print([
    page["page"]
    for page in routes["text"]
])
