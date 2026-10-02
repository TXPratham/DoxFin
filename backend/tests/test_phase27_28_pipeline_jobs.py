"""
Phase 27 & Phase 28 Integration Tests:
- Phase 27: Unified End-to-End Pipeline
  Upload PDF -> Validation -> PyMuPDF -> Classification -> [Text|Tables|Charts] -> Validation -> Financial Engine -> Anomalies -> DB/Cache -> Chunking -> Embeddings -> FAISS -> RAG -> Local LLM -> Explanation + Evidence.
- Phase 28: Proper Processing-Job System
  POST /documents -> HTTP 202 Accepted (document_id, job_id) -> Separate async processing -> Status polling with % and stage checklist.
"""
import sys
import json
import time
from pathlib import Path
from starlette.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Enable UTF-8 for Windows PowerShell output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.main import app
from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.rag_service import RAGService


client = TestClient(app)

print("=" * 80)
print("TESTING PHASE 27 & PHASE 28: END-TO-END PIPELINE & ASYNC JOB SYSTEM")
print("=" * 80)

# 1. Locate test PDF fixture
test_pdf_path = backend_dir.parent / "test.pdf"
if not test_pdf_path.exists():
    uploads_dir = backend_dir / "uploads"
    pdf_files = list(uploads_dir.glob("*.pdf"))
    test_pdf_path = pdf_files[0] if pdf_files else backend_dir / "test.pdf"

assert test_pdf_path.exists(), f"Test PDF not found at {test_pdf_path}"
print(f"\n[Phase 27] Using PDF Document: {test_pdf_path.name} ({test_pdf_path.stat().st_size} bytes)")


# 2. Phase 27 Direct Pipeline Verification
print("\n--- 1. Verifying Phase 27 Complete End-to-End Pipeline Execution ---")
pipeline = DoxFin500PagePipeline(
    base_cache_dir=str(backend_dir / "cache"),
    vector_store_dir=str(backend_dir / "vector_store")
)

progress_events = []
def on_progress(stage, pct, label, status):
    progress_events.append((stage, pct, label, status))

result = pipeline.process_document(
    pdf_path=str(test_pdf_path),
    document_id="doc_phase27_e2e",
    raw_financial_inputs={
        "revenue_current": 18200.0,
        "revenue_previous": 15500.0,
        "net_profit": 2400.0,
        "debt": 4100.0,
        "equity": 6000.0,
        "current_assets": 4800.0,
        "current_liabilities": 3600.0,
        "cfo": 2100.0,
        "capex": 950.0
    },
    force_recompute=True,
    progress_callback=on_progress
)

print(f"✓ Pipeline completed with status: {result['pipeline_status']}")
print(f"✓ Page Count: {result['page_count']}")
print(f"✓ Financial Metrics: YoY Growth={result['financial_metrics']['revenue_growth_yoy']:.2f}%, NPM={result['financial_metrics']['net_profit_margin']:.2f}%, FCF=${result['financial_metrics']['free_cash_flow']:,.2f}")
print(f"✓ Anomalies Detected: {len(result['anomalies'])}")
print(f"✓ FAISS Chunks Indexed: {result['rag_index']['total_chunks_indexed']}")
assert result["pipeline_status"] == "COMPLETED_SUCCESSFULLY"
assert len(progress_events) > 0
print(f"✓ Progress events tracked: {len(progress_events)} stages reported")

# 3. Phase 27 RAG Query + Citation Grounding
print("\n--- 2. Verifying Phase 27 RAG Retrieval & Source Citations ---")
rag_response = RAGService.query_by_doc_id(
    query="What are the key financial ratios and operating results?",
    doc_id="doc_phase27_e2e",
    vector_store_dir=str(backend_dir / "vector_store"),
    top_k=3
)
assert len(rag_response["citations"]) > 0
print(f"✓ Answer Generated: {rag_response['answer'][:120]}...")
print(f"✓ Grounded Citations Count: {len(rag_response['citations'])}")
for c in rag_response["citations"]:
    print(f"   [Page {c['page_number']} | {c['section']}]: {c['text_snippet'][:80]}...")

# 4. Phase 28 Asynchronous HTTP 202 Job Upload System
print("\n--- 3. Verifying Phase 28 Async Job Submission (HTTP 202 Accepted) ---")
test_doc_id = "doc_phase28_async"

with open(test_pdf_path, "rb") as f:
    upload_res = client.post(
        "/documents",
        files={"file": (test_pdf_path.name, f, "application/pdf")},
        data={"document_id": test_doc_id}
    )

print(f"✓ HTTP Status Code: {upload_res.status_code} (Expected 202 Accepted)")
assert upload_res.status_code == 202, f"Expected 202, got {upload_res.status_code}"

upload_data = upload_res.json()
job_id = upload_data.get("job_id")
print(f"✓ Response: document_id='{upload_data.get('document_id')}', job_id='{job_id}', status='{upload_data.get('status')}'")
assert upload_data.get("document_id") == test_doc_id
assert job_id is not None
assert upload_data.get("status") == "processing"

# 5. Phase 28 Progress Polling & Checklist Tracking
print(f"\n--- 4. Polling Status for Job {job_id} / Document {test_doc_id} ---")
max_wait = 30
start_time = time.time()
completed = False

while time.time() - start_time < max_wait:
    status_res = client.get(f"/documents/{test_doc_id}/status")
    assert status_res.status_code == 200
    st_data = status_res.json()
    
    pct = st_data.get("progress_percent", 0)
    current_stage = st_data.get("current_stage", "Pending")
    status_val = st_data.get("status")
    
    print(f"   [Status Poll] Progress: {pct}% | Stage: {current_stage} | Overall Status: {status_val}")
    
    if status_val == "completed":
        completed = True
        print("\n✓ Processing Job Completed Successfully!")
        print(f"✓ Stage Details Checklist ({len(st_data.get('stage_details', []))} stages):")
        for detail in st_data.get("stage_details", []):
            mark = "✓" if detail["status"] == "COMPLETED" else "●"
            print(f"   {mark} {detail['label']} ({detail['status']})")
        break
    time.sleep(0.5)

assert completed, "Background job did not complete within timeout."

# 6. Verify Job Status endpoint /jobs/{job_id}
print(f"\n--- 5. Verifying Direct /jobs/{job_id} Endpoint ---")
job_status_res = client.get(f"/jobs/{job_id}")
assert job_status_res.status_code == 200
assert job_status_res.json()["status"] == "completed"
print(f"✓ GET /jobs/{job_id} returned status: {job_status_res.json()['status']}")

# 7. Verify Metrics and Anomalies for Async Processed Document
print(f"\n--- 6. Verifying Financial Metrics & Anomalies for Ingested Document ---")
metrics_res = client.get(f"/documents/{test_doc_id}/metrics")
assert metrics_res.status_code == 200
metrics_json = metrics_res.json()
assert metrics_json["count"] > 0
print(f"✓ Total Verified Metrics: {metrics_json['count']}")
for m in metrics_json["metrics"][:3]:
    print(f"   - {m['metric_name']}: {m['value']} {m['unit']} ({m['validation_status']})")

anom_res = client.get(f"/documents/{test_doc_id}/anomalies")
assert anom_res.status_code == 200
print(f"✓ Anomalies Endpoint verified (count: {anom_res.json()['count']})")

print("\n" + "=" * 80)
print(">>> ALL TESTS FOR PHASE 27 & PHASE 28 PASSED WITH FLYING COLORS! <<<")
print("=" * 80)
