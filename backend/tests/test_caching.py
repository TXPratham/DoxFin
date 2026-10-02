import sys
import json
import shutil
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.pipeline_service import DoxFin500PagePipeline
from app.services.cache_service import DocumentCacheManager

print("=" * 75)
print("Phase 23: Multi-Stage Caching & Pipeline Resumption Verification")
print("=" * 75)

cache_dir = backend_dir / "cache"
vector_store_dir = backend_dir / "vector_store"
uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if not pdf_files:
    test_pdf = backend_dir.parent / "test.pdf"
else:
    test_pdf = pdf_files[0]

doc_id = "document_123"
doc_cache_dir = cache_dir / doc_id

# Clean prior test state for doc_123
if doc_cache_dir.exists():
    shutil.rmtree(doc_cache_dir)

pipeline = DoxFin500PagePipeline(
    base_cache_dir=str(cache_dir),
    vector_store_dir=str(vector_store_dir)
)

print(f"\n1. Ingesting: {test_pdf.name} (Document ID: {doc_id})")
print("\n--- TEST RUN 1: Simulating Failure at Qwen-VL Stage ---")
try:
    pipeline.process_document(
        pdf_path=str(test_pdf),
        document_id=doc_id,
        simulate_qwen_failure=True
    )
except RuntimeError as e:
    print(f"   [EXPECTED ERROR CAUGHT]: {e}")

# Verify intermediate cached state
cache_manager = DocumentCacheManager(document_id=doc_id, base_cache_dir=cache_dir)
state = cache_manager.get_state()
print("\n2. Intermediate Checkpoint State after Failure:")
for stage, status in state.get("stages", {}).items():
    print(f"   - {stage:25s}: {status}")

assert state["stages"]["pages"] == "COMPLETED", "PyMuPDF pages must be cached!"
assert state["stages"]["tables"] == "COMPLETED", "Docling tables must be cached!"
assert state["stages"]["qwen_charts"] == "FAILED", "Qwen stage must be marked FAILED!"

print("\n--- TEST RUN 2: Resuming Pipeline from Checkpoint ---")
print("   (Earlier stages: PyMuPDF & Docling will be loaded directly from cache without re-running!)")

resumed_result = pipeline.process_document(
    pdf_path=str(test_pdf),
    document_id=doc_id,
    simulate_qwen_failure=False
)

print("\n3. Resumed Execution Result:")
print(f"   Status:             {resumed_result['pipeline_status']}")
print(f"   Total Pages:        {resumed_result['page_count']}")
print(f"   Tables Extracted:   {resumed_result['tables_count']}")
print(f"   Charts Extracted:   {resumed_result['charts_count']}")

# 4. Verify all cache files exist in cache/document_123/
print(f"\n4. Verifying Cache Directory Structure at: {doc_cache_dir}")
expected_files = [
    "metadata.json",
    "pages.json",
    "extracted_text.json",
    "tables.json",
    "charts.json",
    "validated_metrics.json",
    "anomalies.json",
    "processing_state.json"
]

for f_name in expected_files:
    f_path = doc_cache_dir / f_name
    exists = f_path.exists()
    status_sym = "[OK]" if exists else "[MISSING]"
    size_str = f"({f_path.stat().st_size} bytes)" if exists else ""
    print(f"   {status_sym} {f_name:25s} {size_str}")
    assert exists, f"Cache file {f_name} missing!"

# 5. Verify vector_store persistence
index_file = vector_store_dir / f"{doc_id}.index"
meta_file = vector_store_dir / f"{doc_id}_metadata.json"
print(f"\n5. Verifying Vector Store Files:")
print(f"   {'[OK]' if index_file.exists() else '[MISSING]'} {index_file.name}")
print(f"   {'[OK]' if meta_file.exists() else '[MISSING]'} {meta_file.name}")
assert index_file.exists() and meta_file.exists()

print("\n>>> Phase 23 Caching & Resumption Test Passed Successfully! <<<")
