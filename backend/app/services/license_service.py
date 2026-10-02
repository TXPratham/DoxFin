"""
DoxFin Offline Cryptographic License Verification Service (Phase 50).
Verifies enterprise licenses purely locally (air-gapped, zero external network requests).

Supported License Payload:
{
    "customer": "ABC Ltd",
    "product": "DoxFin",
    "max_users": 50,
    "expires": "2027-12-31",
    "features": ["rag", "vision", "financial_analysis"],
    "signature": "<HMAC-SHA256-OR-ED25519-SIGNATURE>"
}
"""
import os
import json
import hmac
import hashlib
from datetime import datetime, date
from pathlib import Path
from typing import Dict, Any, List, Optional

# Public root signing secret for DoxFin Offline System
DOXFIN_SYSTEM_PUBLIC_KEY = os.environ.get(
    "DOXFIN_SIGNING_KEY", "DOXFIN_AIR_GAPPED_SYSTEM_ROOT_SIGNING_KEY_2026_ENTERPRISE"
)
DEFAULT_LICENSE_PATH = Path(__file__).resolve().parent.parent.parent / "licenses" / "doxfin.lic"


class LicenseService:
    def __init__(self, license_path: Optional[Path] = None, signing_key: str = DOXFIN_SYSTEM_PUBLIC_KEY):
        self.license_path = license_path or DEFAULT_LICENSE_PATH
        self.signing_key = signing_key
        self._cached_license: Optional[Dict[str, Any]] = None

    def calculate_signature(self, data: Dict[str, Any]) -> str:
        """
        Deterministic cryptographic hash of canonical license payload.
        Ensures customer, product, max_users, expires, and features cannot be tampered with.
        """
        canonical_fields = {
            "customer": str(data.get("customer", "")).strip(),
            "product": str(data.get("product", "")).strip(),
            "max_users": int(data.get("max_users", 0)),
            "expires": str(data.get("expires", "")).strip(),
            "features": sorted(list(data.get("features", [])))
        }
        canonical_str = json.dumps(canonical_fields, sort_keys=True)
        return hmac.new(
            self.signing_key.encode("utf-8"),
            canonical_str.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def load_license(self, force_reload: bool = False) -> Dict[str, Any]:
        """Loads and parses the local doxfin.lic file."""
        if self._cached_license and not force_reload:
            return self._cached_license

        if not self.license_path.exists():
            # Return built-in trial license if no custom license file exists
            return {
                "customer": "Community / Pilot Evaluation",
                "product": "DoxFin",
                "max_users": 10,
                "expires": "2028-12-31",
                "features": ["rag", "vision", "financial_analysis", "table_extraction", "anomalies"],
                "signature": self.calculate_signature({
                    "customer": "Community / Pilot Evaluation",
                    "product": "DoxFin",
                    "max_users": 10,
                    "expires": "2028-12-31",
                    "features": ["rag", "vision", "financial_analysis", "table_extraction", "anomalies"]
                }),
                "is_trial": True
            }

        try:
            with open(self.license_path, "r", encoding="utf-8") as f:
                content = f.read()
                data = json.loads(content)
                self._cached_license = data
                return data
        except Exception as e:
            return {
                "error": f"Failed to read license file: {str(e)}",
                "valid": False
            }

    def verify_license(self, license_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Verifies license cryptographic signature, expiry, product identity, and features locally.
        Zero internet connection needed.
        """
        data = license_data or self.load_license()

        if "error" in data:
            return {
                "valid": False,
                "reason": data["error"]
            }

        customer = data.get("customer")
        product = data.get("product")
        max_users = data.get("max_users", 0)
        expires_str = data.get("expires")
        features = data.get("features", [])
        provided_signature = data.get("signature", "")

        if product != "DoxFin":
            return {
                "valid": False,
                "reason": f"Invalid product in license: {product} (expected DoxFin)"
            }

        # 1. Verify Cryptographic Signature
        expected_signature = self.calculate_signature(data)
        if not hmac.compare_digest(provided_signature, expected_signature):
            return {
                "valid": False,
                "reason": "Cryptographic signature verification failed. License file has been tampered with or corrupted."
            }

        # 2. Check Expiration Date
        try:
            exp_date = datetime.strptime(expires_str, "%Y-%m-%d").date()
            today = date.today()
            if today > exp_date:
                return {
                    "valid": False,
                    "reason": f"License expired on {expires_str}.",
                    "customer": customer,
                    "expires": expires_str,
                    "expired": True
                }
            days_remaining = (exp_date - today).days
        except Exception as e:
            return {
                "valid": False,
                "reason": f"Invalid expiry date format: {expires_str}"
            }

        return {
            "valid": True,
            "customer": customer,
            "product": product,
            "max_users": max_users,
            "expires": expires_str,
            "days_remaining": days_remaining,
            "features": features,
            "is_trial": data.get("is_trial", False),
            "offline_verified": True
        }

    def has_feature(self, feature_name: str) -> bool:
        """Check if a specific feature (e.g. 'vision', 'rag') is granted."""
        status = self.verify_license()
        if not status.get("valid"):
            return False
        return feature_name in status.get("features", [])


# Global Singleton
license_service = LicenseService()
