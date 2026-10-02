import sys
import json
from pathlib import Path
from starlette.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

print("=" * 75)
print("Phase 25: FastAPI Pipeline Endpoints Integration Test")
print("=" * 75)

# 1. Health Check
res_health = client.get("/health")
assert res_health.status_code == 200
print(f"\n1. Health Check: {res_health.json()}")

# 2. POST /api/v1/documents (Upload and process PDF)
uploads_dir = backend_dir / "uploads"
pdf_files = list(uploads_dir.glob("*.pdf"))

if not pdf_files:
    test_pdf_path = backend_dir.parent / "test.pdf"
else:
    test_pdf_path = pdf_files[0]

doc_id = "doc_fastapi_test"
print(f"\n2. Testing POST /api/v1/documents (Ingesting {test_pdf_path.name})...")

with open(test_pdf_path, "rb") as f:
    upload_res = client.post(
        "/api/v1/documents?sync=true",
        files={"file": (test_pdf_path.name, f, "application/pdf")},
        data={"document_id": doc_id}
    )

print(f"   Status Code: {upload_res.status_code}")
print(f"   Response:    {json.dumps(upload_res.json(), indent=2)}")
assert upload_res.status_code == 200
assert upload_res.json()["document_id"] == doc_id
assert upload_res.json()["status"] == "completed"


# 3. GET /api/v1/documents/{id}/status
print(f"\n3. Testing GET /api/v1/documents/{doc_id}/status...")
status_res = client.get(f"/api/v1/documents/{doc_id}/status")
print(f"   Status Code: {status_res.status_code}")
print(f"   Response:    {json.dumps(status_res.json(), indent=2)}")
assert status_res.status_code == 200
assert status_res.json()["document_id"] == doc_id
assert "stages" in status_res.json()

# 4. GET /api/v1/documents/{id}/metrics
print(f"\n4. Testing GET /api/v1/documents/{doc_id}/metrics...")
metrics_res = client.get(f"/api/v1/documents/{doc_id}/metrics")
print(f"   Status Code: {metrics_res.status_code}")
print(f"   Response:    {json.dumps(metrics_res.json(), indent=2)}")
assert metrics_res.status_code == 200
metrics_data = metrics_res.json()
assert metrics_data["count"] > 0
print(f"   Total Verified Metrics: {metrics_data['count']}")

# 5. GET /api/v1/documents/{id}/anomalies
print(f"\n5. Testing GET /api/v1/documents/{doc_id}/anomalies...")
anom_res = client.get(f"/api/v1/documents/{doc_id}/anomalies")
print(f"   Status Code: {anom_res.status_code}")
print(f"   Response:    {json.dumps(anom_res.json(), indent=2)}")
assert anom_res.status_code == 200

# 6. POST /api/v1/documents/{id}/query (RAG Question)
query_text = "What is the Free Cash Flow and operating performance?"
print(f"\n6. Testing POST /api/v1/documents/{doc_id}/query ('{query_text}')...")
query_res = client.post(
    f"/api/v1/documents/{doc_id}/query",
    json={"query": query_text, "top_k": 3}
)

print(f"   Status Code: {query_res.status_code}")
print(f"   Response:    {json.dumps(query_res.json(), indent=2)}")
assert query_res.status_code == 200
query_data = query_res.json()
assert len(query_data["citations"]) > 0
print(f"   Retrieved Citations Count: {len(query_data['citations'])}")

# 7. GET /api/v1/documents (List all documents)
print(f"\n7. Testing GET /api/v1/documents...")
list_res = client.get("/api/v1/documents")
print(f"   Status Code: {list_res.status_code}")
print(f"   Total Documents: {len(list_res.json()['documents'])}")
assert list_res.status_code == 200

print("\n>>> Phase 25 FastAPI Pipeline Endpoints Passed Successfully! <<<")
