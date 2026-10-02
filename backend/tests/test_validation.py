import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.docling_service import process_with_docling
from app.services.validation_service import ValidationService, normalize_metric

print("--- Testing Phase 8 & 9 (Batched Docling & RapidOCR) ---")
uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if pdf_files:
    test_pdf = pdf_files[0]
    print(f"Testing page_range (1, 2) on {test_pdf.name}...")
    res = process_with_docling(str(test_pdf), page_range=(1, 2), needs_ocr=False)
    print("Page-ranged extraction length:", len(res["markdown"]))

print("\n--- Testing Phase 10 (Validation Layer & Normalization) ---")

# Test metric normalization
sample_raw = [
    {"metric": "Revenue", "value": "16,420", "unit": "crore", "currency": "INR", "period": "FY2025", "page": 146, "source": "income_statement"},
    {"metric": "Net Profit", "value": "(500)", "unit": "crore", "currency": "INR", "period": "FY2025", "page": 146, "source": "income_statement"},
    {"metric": "Revenue", "value": "16,420", "unit": "crore", "currency": "INR", "period": "FY2025", "page": 180, "source": "notes"},
    {"metric": "Revenue", "value": "17,000", "unit": "crore", "currency": "INR", "period": "FY2025", "page": 200, "source": "segment_reporting"},
]

normalized_records = [normalize_metric(**item) for item in sample_raw]
validated_records = ValidationService.validate_records(normalized_records)

print("\nNormalized & Validated Records:")
for r in validated_records:
    print(r)

# Test balance sheet validation
bs_check = ValidationService.validate_balance_sheet(assets=1000.0, liabilities=600.0, equity=400.0)
print("\nBalance Sheet Check (1000 == 600 + 400):", bs_check)

bs_invalid = ValidationService.validate_balance_sheet(assets=1000.0, liabilities=600.0, equity=350.0)
print("Balance Sheet Check (1000 == 600 + 350):", bs_invalid)
