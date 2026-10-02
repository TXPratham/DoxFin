import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.pymupdf_service import inspect_pdf

# Locate target PDF (use annual_report.pdf or fallback to any available PDF in uploads)
uploads_dir = backend_dir / "uploads"
target_pdf = uploads_dir / "annual_report.pdf"

if not target_pdf.exists():
    pdf_files = list(uploads_dir.glob("*.pdf"))
    if pdf_files:
        target_pdf = pdf_files[0]
        print(f"Notice: 'annual_report.pdf' not found. Testing with: {target_pdf.name}")
    else:
        print(f"Error: No PDF files found in {uploads_dir}")
        sys.exit(1)

result = inspect_pdf(str(target_pdf))

print(f"\n--- Inspection Results for {target_pdf.name} ---")
print("Total pages:", result["page_count"])

for page in result["pages"][:10]:
    print(f"Page {page['page_number']}: Text length={page['text_length']}, Images={page['image_count']}, Tables={page['table_count']}, Needs OCR={page['needs_ocr']}")
