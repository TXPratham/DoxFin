import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.vision_service import (
    VisionService,
    is_candidate_financial_chart,
    parse_vlm_chart_output
)
from app.services.validation_service import ValidationService
from app.services.financial_service import growth

print("=" * 70)
print("Phase 19: Selective Visual Intelligence & Qwen-VL Filtering Test")
print("=" * 70)

# 1. Simulate pages from a 500-page report containing 1,200 images
test_pages = [
    {
        "page_number": 1,
        "text": "Annual Report FY2024-25. Building a Sustainable Future.",
        "financial_score": 0,
        "image_count": 3,  # Logo, decorative header
        "description": "Cover page with corporate logo"
    },
    {
        "page_number": 4,
        "text": "Message from the Managing Director and Chief Executive Officer. Dear Shareholders...",
        "financial_score": 1,
        "image_count": 2,  # CEO portrait and signature
        "description": "CEO photograph & signature"
    },
    {
        "page_number": 22,
        "text": "Manufacturing facility expansion in Gujarat with solar power integration.",
        "financial_score": 0,
        "image_count": 4,  # Factory photographs
        "description": "Factory and solar plant photos"
    },
    {
        "page_number": 35,
        "text": "Recognized as Best Corporate Citizen 2024 at Global ESG Leadership Summit.",
        "financial_score": 0,
        "image_count": 5,  # Award trophies and badges
        "description": "ESG awards and certification badges"
    },
    {
        "page_number": 82,
        "text": "Financial Highlights: Figure 4.1 Revenue Growth and CAGR Performance across segments.",
        "financial_score": 4,
        "image_count": 1,  # Revenue Growth bar chart
        "description": "Revenue Growth 3-Year Bar Chart"
    },
    {
        "page_number": 95,
        "text": "Corporate social responsibility employee blood donation drive.",
        "financial_score": 0,
        "image_count": 6,  # Employee group photos
        "description": "CSR volunteer photos"
    }
]

print(f"\n1. Scanning {len(test_pages)} sample pages with selective image filter...")
analyzed_count = 0
skipped_count = 0
extracted_charts = []

for page in test_pages:
    decision = is_candidate_financial_chart(page)
    p_num = page["page_number"]
    desc = page["description"]
    
    if decision["should_analyze"]:
        print(f"   [Page {p_num:2d}] -> ACCEPTED: {desc} (Reason: {decision['reason']})")
        chart_data = VisionService.process_page_images(page)
        extracted_charts.append(chart_data)
        analyzed_count += 1
    else:
        print(f"   [Page {p_num:2d}] -> SKIPPED:  {desc} (Reason: {decision['reason']})")
        skipped_count += 1

print(f"\n2. Filtering Summary:")
print(f"   Total Pages Evaluated:  {len(test_pages)}")
print(f"   Pages Sent to Qwen-VL:  {analyzed_count} (Only legitimate financial charts)")
print(f"   Pages Skipped/Ignored:  {skipped_count} (Logos, portraits, factories, awards)")

assert analyzed_count == 1, "Only Page 82 should be routed to Qwen-VL!"
assert skipped_count == 5, "5 non-financial pages must be skipped!"

# 3. Inspect structured output for Page 82
print("\n3. Structured Qwen3-VL Output from Page 82:")
chart = extracted_charts[0]
print(f"   Chart Type: {chart['chart_type']}")
print(f"   Title:      {chart['title']}")
print(f"   Values:     {chart['values']}")
print(f"   Page:       {chart['page']}")

# 4. Phase 19 Validation Layer Handshake:
print("\n4. Handshake with Validation Layer & Deterministic Arithmetic:")
vals = chart["values"]
fy23 = vals["FY2023"]
fy24 = vals["FY2024"]
fy25 = vals["FY2025"]

growth_23_24 = growth(fy24, fy23)
growth_24_25 = growth(fy25, fy24)

print(f"   FY23 -> FY24 YoY Growth: {growth_23_24:.2f}% (Deterministic Python calculation)")
print(f"   FY24 -> FY25 YoY Growth: {growth_24_25:.2f}% (Deterministic Python calculation)")

# Pass to ValidationService
validation_records = chart["validation_records"]
validated = ValidationService.validate_records(validation_records)
print("\n5. Validated Record Statuses:")
for r in validated:
    print(f"   Metric: {r['metric']} | Period: {r['period']} | Value: {r['value']} {r['unit']} | Status: {r['validation_status']}")

print("\n>>> Phase 19 Selective Vision & Validation Test Passed Successfully! <<<")
