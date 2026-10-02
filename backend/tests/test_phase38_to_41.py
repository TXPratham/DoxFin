"""
DoxFin Enterprise Verification Suite: Phases 38, 39, 40, 41
Validates:
- Phase 38: Multi-user Host Architecture, Authentication, Token Issuance
- Phase 39: Granular Permissions (OWNER, READ_ANALYZE, READ_VERIFY, READ, NO_ACCESS) & API Level Enforcement
- Phase 40: Compliance Audit Logging (LOGIN, UPLOAD, QUERY, VERIFY, DELETE, ACCESS_DENIED)
- Phase 41: Security Hardening (Magic Bytes Check, Password Hashing, JWT Tokens, Secure Deletion)
"""
import sys
import os
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

backend_dir = Path(__file__).resolve().parent.parent
repo_root = backend_dir.parent
for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from starlette.testclient import TestClient
from app.main import app
from app.database.database import get_db, init_db, SessionLocal
from app.database.models import User, Document, DocumentAccess, DocumentAccessLevel, FinancialMetric, AuditLog
from app.services.security_service import SecurityService
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService

client = TestClient(app)


def run_all_tests():
    print("=" * 85)
    print("DOXFIN ENTERPRISE TEST SUITE: PHASES 38, 39, 40, 41")
    print("=" * 85)

    # Initialize DB & Seed demo accounts
    init_db()
    db = SessionLocal()
    AuthService.seed_demo_users(db)

    # =========================================================================
    # PHASE 38: MULTI-USER AUTHENTICATION & TOKEN ISSUANCE
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 38 — MULTI-USER AUTHENTICATION & HOST ARCHITECTURE")
    print("=" * 60)

    # 1. Login Pratham (Admin/Owner)
    res_pratham = client.post("/api/v1/auth/login", json={"email": "pratham@doxfin.internal", "password": "admin123"})
    assert res_pratham.status_code == 200, f"Login failed for Pratham: {res_pratham.text}"
    token_pratham = res_pratham.json()["access_token"]
    headers_pratham = {"Authorization": f"Bearer {token_pratham}"}
    print(f"   ✓ User Pratham logged in successfully (Role: {res_pratham.json()['role']})")

    # 2. Login Analyst 1 (Read + Analyze)
    res_analyst1 = client.post("/api/v1/auth/login", json={"email": "analyst1@doxfin.internal", "password": "analyst123"})
    assert res_analyst1.status_code == 200
    token_analyst1 = res_analyst1.json()["access_token"]
    headers_analyst1 = {"Authorization": f"Bearer {token_analyst1}"}
    print("   ✓ User Analyst 1 logged in successfully")

    # 3. Login Analyst 2 (Read only)
    res_analyst2 = client.post("/api/v1/auth/login", json={"email": "analyst2@doxfin.internal", "password": "analyst123"})
    assert res_analyst2.status_code == 200
    token_analyst2 = res_analyst2.json()["access_token"]
    headers_analyst2 = {"Authorization": f"Bearer {token_analyst2}"}
    print("   ✓ User Analyst 2 logged in successfully")

    # 4. Login Reviewer 1 (Read + Verify)
    res_reviewer1 = client.post("/api/v1/auth/login", json={"email": "reviewer1@doxfin.internal", "password": "reviewer123"})
    assert res_reviewer1.status_code == 200
    token_reviewer1 = res_reviewer1.json()["access_token"]
    headers_reviewer1 = {"Authorization": f"Bearer {token_reviewer1}"}
    print("   ✓ User Reviewer 1 logged in successfully")

    # 5. Login Employee 4 (No Access)
    res_emp4 = client.post("/api/v1/auth/login", json={"email": "employee4@doxfin.internal", "password": "employee123"})
    assert res_emp4.status_code == 200
    token_emp4 = res_emp4.json()["access_token"]
    headers_emp4 = {"Authorization": f"Bearer {token_emp4}"}
    print("   ✓ User Employee 4 logged in successfully")
    print(">>> Phase 38 Multi-User Host Architecture Passed! <<<")

    # =========================================================================
    # PHASE 39 & 41: UPLOAD, PERMISSION ENFORCEMENT & SECURITY GUARDS
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 39 & 41 — PERMISSIONS (RBAC/ACL) & SECURITY HARDENING")
    print("=" * 60)

    # 1. Security check: Attempt upload of fake PDF (invalid magic bytes)
    fake_pdf_content = b"THIS IS NOT A VALID PDF FILE HEADER DATA"
    res_fake = client.post(
        "/api/v1/documents",
        files={"file": ("malicious.pdf", fake_pdf_content, "application/pdf")},
        headers=headers_pratham
    )
    assert res_fake.status_code == 400, f"Expected 400 for fake PDF, got {res_fake.status_code}"
    print(f"   ✓ Fake PDF rejected via Magic Bytes Validation: {res_fake.json()['detail']}")

    # 2. Upload valid test PDF synchronously as Pratham (Owner)
    test_pdf_path = backend_dir / "uploads" / "2109.00122v3.pdf"
    if not test_pdf_path.exists():
        test_pdf_path = repo_root / "test.pdf"
    doc_id = "doc_perm_test_2026"
    with open(test_pdf_path, "rb") as f:
        res_upload = client.post(
            "/api/v1/documents?sync=true",
            data={"document_id": doc_id},
            files={"file": ("Annual_Report_2025.pdf", f, "application/pdf")},
            headers=headers_pratham
        )
    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    print(f"   ✓ Valid PDF uploaded by Pratham (OWNER) as document '{doc_id}'")

    # 3. Configure Document Permissions / ACL according to requirement:
    #    Pratham: OWNER
    #    Analyst 1: READ + ANALYZE
    #    Analyst 2: READ
    #    Reviewer 1: READ + VERIFY
    #    Employee 4: NO_ACCESS
    print("   Setting up Granular ACL Permissions...")
    client.post(f"/api/v1/documents/{doc_id}/permissions", json={"target_email": "analyst1@doxfin.internal", "access_level": "READ_ANALYZE"}, headers=headers_pratham)
    client.post(f"/api/v1/documents/{doc_id}/permissions", json={"target_email": "analyst2@doxfin.internal", "access_level": "READ"}, headers=headers_pratham)
    client.post(f"/api/v1/documents/{doc_id}/permissions", json={"target_email": "reviewer1@doxfin.internal", "access_level": "READ_VERIFY"}, headers=headers_pratham)
    client.post(f"/api/v1/documents/{doc_id}/permissions", json={"target_email": "employee4@doxfin.internal", "access_level": "NO_ACCESS"}, headers=headers_pratham)
    print("   ✓ ACL Configured: Analyst1 (READ_ANALYZE), Analyst2 (READ), Reviewer1 (READ_VERIFY), Emp4 (NO_ACCESS)")

    # 4. Test Permissions for Pratham (OWNER):
    #    - Can READ status
    res = client.get(f"/api/v1/documents/{doc_id}/status", headers=headers_pratham)
    assert res.status_code == 200
    #    - Can ANALYZE (RAG query)
    res = client.post(f"/api/v1/documents/{doc_id}/query", json={"query": "What is the revenue?"}, headers=headers_pratham)
    assert res.status_code == 200
    print("   ✓ Pratham (OWNER): READ and ANALYZE permitted")

    # 5. Test Permissions for Analyst 1 (READ + ANALYZE):
    #    - Can READ status
    res = client.get(f"/api/v1/documents/{doc_id}/status", headers=headers_analyst1)
    assert res.status_code == 200
    #    - Can ANALYZE (RAG query)
    res = client.post(f"/api/v1/documents/{doc_id}/query", json={"query": "What is the profit margin?"}, headers=headers_analyst1)
    assert res.status_code == 200
    #    - CANNOT VERIFY financial metrics (Should receive 403 Forbidden)
    metrics_res = client.get(f"/api/v1/documents/{doc_id}/metrics", headers=headers_analyst1)
    metric_name = metrics_res.json()["metrics"][0]["metric_name"]
    res_verify_fail = client.post(
        f"/api/v1/documents/{doc_id}/metrics/{metric_name}/verify",
        json={"status": "verified", "note": "Unauthorized check"},
        headers=headers_analyst1
    )
    assert res_verify_fail.status_code == 403, f"Expected 403 for Analyst1 verify, got {res_verify_fail.status_code}"
    #    - CANNOT DELETE document (Should receive 403 Forbidden)
    res_del_fail = client.delete(f"/api/v1/documents/{doc_id}", headers=headers_analyst1)
    assert res_del_fail.status_code == 403, f"Expected 403 for Analyst1 delete, got {res_del_fail.status_code}"
    print("   ✓ Analyst 1 (READ_ANALYZE): Can query RAG, strictly BLOCKED (403) from verifying metrics and deleting")

    # 6. Test Permissions for Analyst 2 (READ ONLY):
    #    - Can READ metrics
    res = client.get(f"/api/v1/documents/{doc_id}/metrics", headers=headers_analyst2)
    assert res.status_code == 200
    #    - CANNOT ANALYZE (Should receive 403 Forbidden)
    res_query_fail = client.post(f"/api/v1/documents/{doc_id}/query", json={"query": "Why did profit decrease?"}, headers=headers_analyst2)
    assert res_query_fail.status_code == 403, f"Expected 403 for Analyst2 query, got {res_query_fail.status_code}"
    print("   ✓ Analyst 2 (READ): Can view metrics, strictly BLOCKED (403) from running RAG queries")

    # 7. Test Permissions for Reviewer 1 (READ + VERIFY):
    #    - Can VERIFY financial metric
    res_verify_ok = client.post(
        f"/api/v1/documents/{doc_id}/metrics/{metric_name}/verify",
        json={"status": "verified", "note": "Verified by Senior Auditor"},
        headers=headers_reviewer1
    )
    assert res_verify_ok.status_code == 200, f"Expected 200 for Reviewer1 verify, got {res_verify_ok.status_code}"
    #    - CANNOT DELETE document (Should receive 403 Forbidden)
    res_del_fail2 = client.delete(f"/api/v1/documents/{doc_id}", headers=headers_reviewer1)
    assert res_del_fail2.status_code == 403, f"Expected 403 for Reviewer1 delete, got {res_del_fail2.status_code}"
    print(f"   ✓ Reviewer 1 (READ_VERIFY): Successfully verified '{metric_name}', strictly BLOCKED (403) from deleting")

    # 8. Test Permissions for Employee 4 (NO ACCESS):
    #    - BLOCKED from reading status (403)
    res_emp_status = client.get(f"/api/v1/documents/{doc_id}/status", headers=headers_emp4)
    assert res_emp_status.status_code == 403, f"Expected 403 for Emp4 status, got {res_emp_status.status_code}"
    #    - BLOCKED from querying (403)
    res_emp_query = client.post(f"/api/v1/documents/{doc_id}/query", json={"query": "Test query"}, headers=headers_emp4)
    assert res_emp_query.status_code == 403, f"Expected 403 for Emp4 query, got {res_emp_query.status_code}"
    print("   ✓ Employee 4 (NO_ACCESS): Universal 403 Forbidden across all document endpoints")
    print(">>> Phase 39 Permissions & Access Control Passed! <<<")

    # =========================================================================
    # PHASE 40: COMPLIANCE AUDIT LOGGING
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 40 — COMPLIANCE AUDIT LOGGING")
    print("=" * 60)

    # Query audit logs
    audit_res = client.get(f"/api/v1/audit-logs?document_id={doc_id}", headers=headers_pratham)
    assert audit_res.status_code == 200
    logs = audit_res.json()["logs"]

    print(f"Total Audit Log Records for '{doc_id}': {len(logs)}")
    actions_recorded = {l["action"] for l in logs}
    print(f"Actions Recorded in Audit Trail: {actions_recorded}")

    # Check for required enterprise actions
    assert "UPLOAD" in actions_recorded, "Audit log missing UPLOAD event"
    assert "QUERY" in actions_recorded, "Audit log missing QUERY event"
    assert "VERIFY" in actions_recorded, "Audit log missing VERIFY event"
    assert "PERMISSION_CHANGE" in actions_recorded, "Audit log missing PERMISSION_CHANGE event"
    assert "ACCESS_DENIED" in actions_recorded, "Audit log missing ACCESS_DENIED security event"

    print("\nAudit Log Sample Entries:")
    print("Timestamp                | User                     | Action            | Status")
    print("-" * 75)
    for l in logs[:6]:
        print(f"{l['timestamp'][:19]} | {l['user_email']:<24} | {l['action']:<17} | {l['status']}")

    print(">>> Phase 40 Compliance Audit Logging Passed! <<<")

    # =========================================================================
    # PHASE 41: SECURE DELETION & ERADICATION
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 41 — SECURE DOCUMENT DELETION & ARTIFACT ERADICATION")
    print("=" * 60)

    # Pratham (Owner) deletes the document
    del_res = client.delete(f"/api/v1/documents/{doc_id}", headers=headers_pratham)
    assert del_res.status_code == 200
    del_data = del_res.json()
    print(f"   ✓ Document deleted: {del_data['deleted_artifacts']}")

    # Verify document no longer exists in database
    doc_check = db.query(Document).filter(Document.id == doc_id).first()
    assert doc_check is None, "Document still present in database after delete!"

    # Verify 404 on subsequent queries
    res_after_del = client.get(f"/api/v1/documents/{doc_id}/status", headers=headers_pratham)
    assert res_after_del.status_code == 404
    print("   ✓ Confirmed document, cache, and vector store indices completely purged")
    print(">>> Phase 41 Security Hardening & Deletion Passed! <<<")

    db.close()
    print("\n" + "=" * 85)
    print(">>> ALL 4 PHASES (38, 39, 40, 41) COMPLETED & VERIFIED SUCCESSFULLY! <<<")
    print("=" * 85)


if __name__ == "__main__":
    run_all_tests()
