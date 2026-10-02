"""
DoxFin Enterprise Offline License Generator (Phase 50).
Generates cryptographically signed doxfin.lic files for customer deployments.
"""
import sys
import json
import argparse
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.services.license_service import license_service


def generate_signed_license(
    customer: str,
    product: str = "DoxFin",
    max_users: int = 50,
    expires: str = "2027-12-31",
    features: list = None,
    output_path: str = None
) -> dict:
    if features is None:
        features = ["rag", "vision", "financial_analysis", "table_extraction", "anomalies", "export"]

    license_payload = {
        "customer": customer,
        "product": product,
        "max_users": max_users,
        "expires": expires,
        "features": features
    }

    # Generate cryptographic signature
    signature = license_service.calculate_signature(license_payload)
    license_payload["signature"] = signature

    if output_path:
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w", encoding="utf-8") as f:
            json.dump(license_payload, f, indent=4)
        print(f"[OK] Generated signed license file: {out_p.resolve()}")

    return license_payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate signed DoxFin license")
    parser.add_argument("--customer", type=str, default="ABC Ltd", help="Customer company name")
    parser.add_argument("--users", type=int, default=50, help="Maximum users")
    parser.add_argument("--expires", type=str, default="2027-12-31", help="Expiration date (YYYY-MM-DD)")
    parser.add_argument("--out", type=str, default="../licenses/doxfin.lic", help="Output file path")

    args = parser.parse_args()
    lic = generate_signed_license(
        customer=args.customer,
        max_users=args.users,
        expires=args.expires,
        output_path=args.out
    )
    print("\nLicense Payload:")
    print(json.dumps(lic, indent=2))
