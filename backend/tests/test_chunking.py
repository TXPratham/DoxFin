import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.pymupdf_service import inspect_pdf
from app.services.classifier_service import classify_page
from app.services.chunking_service import create_document_chunks

uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if not pdf_files:
    print("No PDF files found.")
    sys.exit(1)

test_pdf = pdf_files[0]
print(f"Testing document chunking on: {test_pdf.name}...")

inspection = inspect_pdf(str(test_pdf))
classified_pages = [classify_page(p) for p in inspection["pages"]]

chunks = create_document_chunks(classified_pages, document_id="doc1")

print(f"\nTotal Chunks Created: {len(chunks)}")
print("\n--- Sample Chunks (First 3) ---")
for c in chunks[:3]:
    display_c = dict(c)
    # Encode text safely for console printing
    display_c["text"] = display_c["text"][:100].encode("ascii", "replace").decode("ascii") + "..."
    print(display_c)
    print("-" * 50)
