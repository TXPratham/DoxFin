import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.docling_service import process_with_docling

uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if not pdf_files:
    print("No PDF files found in uploads directory.")
    sys.exit(1)

test_pdf = pdf_files[0]
print(f"Testing process_with_docling on: {test_pdf.name}...")

res = process_with_docling(str(test_pdf))

markdown_output = res.get("markdown", "")
print("Processing complete!")
print(f"Exported Markdown length: {len(markdown_output)} characters")
print("\n--- First 500 characters of Markdown ---")
print(markdown_output[:500])
