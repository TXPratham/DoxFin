"""
Comprehensive Integration Tests for Packaging, Offline License, Pilot Monitoring & Production Release (Phases 49, 50, 51, 52).
"""
import os
import sys
import json
import tempfile
from pathlib import Path
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.main import app
from app.services.license_service import LicenseService
from app.services.pilot_service import pilot_service
from app.database.database import SessionLocal, init_db


client = TestClient(app)


# Initialize DB schema for test run
init_db()



# ==========================================
# 1. PHASE 50: OFFLINE CRYPTOGRAPHIC LICENSING
# ==========================================

def test_valid_offline_license():
    lic_service = LicenseService()
    valid_payload = {
        "customer": "Test Corp Ltd",
        "product": "DoxFin",
        "max_users": 25,
        "expires": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
        "features": ["rag", "vision", "financial_analysis"]
    }
    signature = lic_service.calculate_signature(valid_payload)
    valid_payload["signature"] = signature

    result = lic_service.verify_license(valid_payload)
    assert result["valid"] is True
    assert result["customer"] == "Test Corp Ltd"
    assert result["max_users"] == 25
    assert result["offline_verified"] is True
    assert "rag" in result["features"]


def test_tampered_license_rejection():
    lic_service = LicenseService()
    tampered_payload = {
        "customer": "Tampered Corp",
        "product": "DoxFin",
        "max_users": 9999,  # Illegally elevated users
        "expires": "2030-12-31",
        "features": ["rag", "vision"],
        "signature": "invalid_fake_signature_12345"
    }
    result = lic_service.verify_license(tampered_payload)
    assert result["valid"] is False
    assert "tampered" in result["reason"].lower() or "failed" in result["reason"].lower()


def test_expired_license_rejection():
    lic_service = LicenseService()
    expired_payload = {
        "customer": "Expired Corp",
        "product": "DoxFin",
        "max_users": 10,
        "expires": "2020-01-01",  # Past date
        "features": ["rag"]
    }
    signature = lic_service.calculate_signature(expired_payload)
    expired_payload["signature"] = signature

    result = lic_service.verify_license(expired_payload)
    assert result["valid"] is False
    assert "expired" in result["reason"].lower()


def test_license_api_endpoint():
    res = client.get("/api/v1/license/status")
    assert res.status_code == 200
    data = res.json()
    assert "license_installed" in data
    assert "details" in data


# ==========================================
# 2. PHASE 51: PILOT TELEMETRY & ISSUE TRACKER
# ==========================================

def test_pilot_feedback_lifecycle():
    db = SessionLocal()
    try:
        # 1. Post new extraction issue
        post_res = client.post(
            "/api/v1/pilot/feedback",
            json={
                "title": "Cash flow receivables unit mismatch",
                "description": "Operating cash flow extracted as Lakh instead of Crore on page 151.",
                "category": "INCORRECT_UNITS",
                "severity": "HIGH",
                "page_number": 151,
                "expected_value": "₹2,100 Cr",
                "actual_value": "₹2,100 Lakh"
            }
        )
        assert post_res.status_code == 201
        issue_id = post_res.json()["issue_id"]

        # 2. List pilot issues
        list_res = client.get("/api/v1/pilot/issues?category=INCORRECT_UNITS")
        assert list_res.status_code == 200
        issues = list_res.json()["issues"]
        assert any(i["id"] == issue_id for i in issues)

        # 3. Update issue status to RESOLVED
        patch_res = client.patch(
            f"/api/v1/pilot/issues/{issue_id}",
            json={
                "status": "RESOLVED",
                "resolution_notes": "Added crore vs lakh context parser in unit normalizer."
            }
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["new_status"] == "RESOLVED"

        # 4. Check pilot readiness summary
        summary_res = client.get("/api/v1/pilot/summary")
        assert summary_res.status_code == 200
        summary = summary_res.json()
        assert "pilot_readiness_score_pct" in summary
        assert "production_gate_status" in summary
        assert summary["total_issues_logged"] >= 1
    finally:
        db.close()


# ==========================================
# 3. PHASE 52: PRODUCTION SYSTEM MATRIX
# ==========================================

def test_production_system_matrix_health():
    res = client.get("/api/v1/system/matrix")
    assert res.status_code == 200
    data = res.json()
    assert data["system_status"] == "ONLINE"
    assert "pipeline_subsystems" in data
    assert "fastapi_host" in data["pipeline_subsystems"]
    assert "deterministic_financial_engine" in data["pipeline_subsystems"]
    assert "hardware" in data
    assert "license" in data


if __name__ == "__main__":
    print("Running test_valid_offline_license()...")
    test_valid_offline_license()
    print("[PASS] test_valid_offline_license")

    print("Running test_tampered_license_rejection()...")
    test_tampered_license_rejection()
    print("[PASS] test_tampered_license_rejection")

    print("Running test_expired_license_rejection()...")
    test_expired_license_rejection()
    print("[PASS] test_expired_license_rejection")

    print("Running test_license_api_endpoint()...")
    test_license_api_endpoint()
    print("[PASS] test_license_api_endpoint")

    print("Running test_pilot_feedback_lifecycle()...")
    test_pilot_feedback_lifecycle()
    print("[PASS] test_pilot_feedback_lifecycle")

    print("Running test_production_system_matrix_health()...")
    test_production_system_matrix_health()
    print("[PASS] test_production_system_matrix_health")

    print("\n==============================================")
    print("ALL ENTERPRISE, LICENSING & PILOT TESTS PASSED!")
    print("==============================================")

