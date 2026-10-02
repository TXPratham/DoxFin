import sys
import json
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.pipeline_service import DoxFin500PagePipeline, AnomalyDetector
from app.services.rag_service import RAGService

print("=" * 75)
print("Phase 20, 21 & 22: Optimized 500-Page Pipeline End-to-End Test")
print("=" * 75)

# Locate test PDF
uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if not pdf_files:
    test_pdf = backend_dir.parent / "test.pdf"
else:
    test_pdf = pdf_files[0]

print(f"\n1. Ingesting Financial Document: {test_pdf.name}")

pipeline = DoxFin500PagePipeline(vector_store_dir=str(backend_dir / "vector_store"))

# Test execution with realistic financial inputs
financial_inputs = {
    "revenue_current": 16420.0,
    "revenue_previous": 14200.0,
    "net_profit": 2150.0,
    "debt": 3800.0,
    "equity": 5200.0,
    "current_assets": 4100.0,
    "current_liabilities": 3200.0,
    "cfo": 1850.0,
    "capex": 900.0
}

doc_id = "doc_enterprise_500"
result = pipeline.process_document(
    pdf_path=str(test_pdf),
    document_id=doc_id,
    raw_financial_inputs=financial_inputs
)

print("\n2. Pipeline Execution Summary:")
print(f"   Document ID:          {result['document_id']}")
print(f"   Total Pages:          {result['page_count']}")
print(f"   Digital Text Pages:   {result['routing_summary']['digital_text_pages']}")
print(f"   Docling Table Pages:  {result['routing_summary']['tables_docling_pages']}")
print(f"   Qwen3-VL Chart Pages: {result['routing_summary']['charts_vision_pages']}")

print("\n3. Deterministic Financial Engine Calculations:")
metrics = result["financial_metrics"]
print(f"   YoY Revenue Growth:   {metrics['revenue_growth_yoy']:.2f}%")
print(f"   Net Profit Margin:    {metrics['net_profit_margin']:.2f}%")
print(f"   Debt-to-Equity:       {metrics['debt_to_equity']:.2f}")
print(f"   Current Ratio:        {metrics['current_ratio']:.2f}")
print(f"   Free Cash Flow:       ${metrics['free_cash_flow']:,.2f}M")

print("\n4. Anomaly Detector Status:")
anomalies = result["anomalies"]
if anomalies:
    for a in anomalies:
        print(f"   [{a['severity']}] {a['type']}: {a['message']}")
else:
    print("   [CLEAN] No accounting divergence or liquidity strain detected.")

print("\n5. RAG Vector Store Persistence:")
print(f"   Total Chunks Indexed: {result['rag_index']['total_chunks_indexed']}")
print(f"   Index File:           {result['rag_index']['index_path']}")
print(f"   Metadata File:        {result['rag_index']['metadata_path']}")

# 6. Test RAG Query on newly indexed document
query = "What is the Free Cash Flow and liquidity position?"
print(f"\n6. Local RAG Query Verification: '{query}'")
rag_response = RAGService.query_by_doc_id(
    query=query,
    doc_id=doc_id,
    vector_store_dir=str(backend_dir / "vector_store"),
    top_k=3
)

print(f"   Retrieved Chunks:     {rag_response['retrieved_chunks_count']}")
for c in rag_response["citations"]:
    print(f"   - Page {c['page_number']} [{c['section']}] (Score: {c['score']}): {c['text_snippet'][:90]}...")

print("\n>>> Phase 20, 21 & 22 End-to-End Pipeline Passed Successfully! <<<")
