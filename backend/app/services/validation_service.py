"""Validation & Normalization Service for Extracted Financial Figures."""
import re
from typing import Dict, Any, List, Optional, Tuple, Union


def parse_numeric_value(val_str: Union[str, float, int]) -> Optional[float]:
    """Parse raw string or numeric input into a float (e.g. '16,420' -> 16420.0, '(500)' -> -500.0)."""
    if isinstance(val_str, (int, float)):
        return float(val_str)

    if not val_str:
        return None

    cleaned = str(val_str).strip()
    
    # Check for negative in parentheses: (100) -> -100
    is_negative = False
    if cleaned.startswith("(") and cleaned.endswith(")"):
        is_negative = True
        cleaned = cleaned[1:-1]

    # Remove commas and currency symbols
    cleaned = re.sub(r"[^\d.-]", "", cleaned)

    try:
        val = float(cleaned)
        return -val if is_negative else val
    except ValueError:
        return None


def normalize_metric(
    metric: str,
    value: Union[str, float, int],
    unit: str = "crore",
    currency: str = "INR",
    period: str = "FY2025",
    page: Optional[int] = None,
    source: str = "extracted_table"
) -> Dict[str, Any]:
    """
    Normalizes raw extracted financial metrics into structured DoxFin format.
    Structure:
    {
        "metric": "Revenue",
        "value": 16420,
        "unit": "crore",
        "currency": "INR",
        "period": "FY2025",
        "page": 146,
        "source": "income_statement",
        "validation_status": "verified" | "flagged" | "unverified"
    }
    """
    numeric_val = parse_numeric_value(value)
    validation_status = "verified" if numeric_val is not None else "flagged"

    return {
        "metric": metric.strip(),
        "value": numeric_val,
        "unit": unit.lower() if unit else "crore",
        "currency": currency.upper() if currency else "INR",
        "period": period if period else "FY2025",
        "page": page,
        "source": source,
        "validation_status": validation_status
    }


class ValidationService:
    @staticmethod
    def validate_balance_sheet(assets: float, liabilities: float, equity: float, tolerance: float = 0.01) -> Dict[str, Any]:
        """
        Verify fundamental accounting equation: Assets == Liabilities + Equity
        """
        expected_assets = liabilities + equity
        diff = abs(assets - expected_assets)
        is_valid = diff <= tolerance

        return {
            "is_valid": is_valid,
            "assets": assets,
            "liabilities": liabilities,
            "equity": equity,
            "expected_assets": expected_assets,
            "discrepancy": round(diff, 4),
            "status": "verified" if is_valid else "discrepancy_detected"
        }

    @staticmethod
    def validate_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validates a collection of financial records for duplicates, conflicting values, and missing fields.
        """
        validated_records = []
        seen_keys: Dict[Tuple[str, str, str], float] = {}  # (metric, period, unit) -> value

        for rec in records:
            metric = rec.get("metric")
            period = rec.get("period")
            unit = rec.get("unit")
            val = rec.get("value")

            key = (metric, period, unit)
            status = rec.get("validation_status", "unverified")

            if val is None:
                status = "missing_value"
            elif key in seen_keys:
                prev_val = seen_keys[key]
                if abs(prev_val - val) > 1e-4:
                    status = "conflicting_value"
                else:
                    status = "duplicate_verified"
            else:
                seen_keys[key] = val

            rec_copy = dict(rec)
            rec_copy["validation_status"] = status
            validated_records.append(rec_copy)

        return validated_records
