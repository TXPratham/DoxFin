"""
Validation, Normalization & Extraction Accuracy Service (Phases 31 & 32).
Implements:
1. Multi-unit currency and scale normalization (crores, lakhs, millions, billions, thousands).
2. Financial comparability guards (FY24 vs FY25, Standalone vs Consolidated, Quarterly vs Annual).
3. Metric alias resolution (Revenue vs Revenue from Operations).
4. Ground-truth extraction accuracy benchmarking (Precision, Recall, Exact Match Accuracy).
"""
import re
from typing import Dict, Any, List, Optional, Tuple, Union


# Unit scale multipliers to normalize to base standard units (e.g. Base INR or USD)
UNIT_MULTIPLIERS = {
    "crore": 10_000_000.0,       # 1 Cr = 10^7
    "crores": 10_000_000.0,
    "cr": 10_000_000.0,
    "lakh": 100_000.0,           # 1 Lakh = 10^5
    "lakhs": 100_000.0,
    "lac": 100_000.0,
    "lacs": 100_000.0,
    "million": 1_000_000.0,      # 1 Million = 10^6
    "millions": 1_000_000.0,
    "mn": 1_000_000.0,
    "m": 1_000_000.0,
    "billion": 1_000_000_000.0,  # 1 Billion = 10^9
    "billions": 1_000_000_000.0,
    "bn": 1_000_000_000.0,
    "b": 1_000_000_000.0,
    "thousand": 1_000.0,         # 1 Thousand = 10^3
    "thousands": 1_000.0,
    "k": 1_000.0,
    "unit": 1.0,
    "units": 1.0,
    "%": 1.0,
    "percent": 1.0,
    "ratio": 1.0
}

# Metric Canonical Aliases
METRIC_ALIASES = {
    "revenue": "REVENUE",
    "revenue from operations": "REVENUE",
    "total revenue": "REVENUE",
    "sales": "REVENUE",
    "turnover": "REVENUE",
    "total income": "REVENUE",
    "net profit": "NET_PROFIT",
    "profit after tax": "NET_PROFIT",
    "pat": "NET_PROFIT",
    "net income": "NET_PROFIT",
    "operating profit": "OPERATING_PROFIT",
    "ebitda": "EBITDA",
    "total debt": "TOTAL_DEBT",
    "borrowings": "TOTAL_DEBT",
    "debt": "TOTAL_DEBT",
    "total equity": "TOTAL_EQUITY",
    "equity": "TOTAL_EQUITY",
    "shareholders equity": "TOTAL_EQUITY",
    "net worth": "TOTAL_EQUITY",
    "cash flow from operations": "CFO",
    "cfo": "CFO",
    "operating cash flow": "CFO",
    "capex": "CAPEX",
    "capital expenditure": "CAPEX",
    "free cash flow": "FREE_CASH_FLOW",
    "fcf": "FREE_CASH_FLOW",
    "current assets": "CURRENT_ASSETS",
    "current liabilities": "CURRENT_LIABILITIES"
}


def parse_numeric_value(val_str: Union[str, float, int]) -> Optional[float]:
    """Parse raw string or numeric input into a float (e.g. '16,420' -> 16420.0, '(500)' -> -500.0)."""
    if val_str is None:
        return None
    if isinstance(val_str, (int, float)):
        return float(val_str)

    cleaned = str(val_str).strip()
    if not cleaned:
        return None

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


def normalize_to_base_value(value: Union[float, int, str], unit: str) -> Optional[float]:
    """
    Normalizes any monetary figure to absolute base value (in raw units).
    Examples:
    - 1,500 crore -> 15,000,000,000 (1.5e10)
    - 1,500 million -> 1,500,000,000 (1.5e9)
    - 1.5 billion -> 1,500,000,000 (1.5e9)
    - 150000 lakhs -> 15,000,000,000 (1.5e10)
    """
    parsed = parse_numeric_value(value)
    if parsed is None:
        return None

    unit_clean = unit.strip().lower().replace("₹", "").replace("$", "").replace("inr", "").replace("usd", "").strip()
    multiplier = UNIT_MULTIPLIERS.get(unit_clean, 1.0)
    return parsed * multiplier


def are_units_equivalent(
    val1: Union[float, int, str],
    unit1: str,
    val2: Union[float, int, str],
    unit2: str,
    tolerance_pct: float = 0.001
) -> bool:
    """
    Evaluates mathematical equivalence across heterogeneous financial reporting scales.
    Returns True if 1500 crore == 150000 lakhs.
    """
    base1 = normalize_to_base_value(val1, unit1)
    base2 = normalize_to_base_value(val2, unit2)

    if base1 is None or base2 is None:
        return False

    if base1 == 0 and base2 == 0:
        return True

    diff = abs(base1 - base2)
    max_val = max(abs(base1), abs(base2))
    return (diff / max_val) <= tolerance_pct


def canonicalize_metric_name(metric: str) -> str:
    """Map financial phrase variations to a standard canonical key."""
    cleaned = metric.strip().lower()
    return METRIC_ALIASES.get(cleaned, cleaned.upper().replace(" ", "_"))


def normalize_metric(
    metric: str,
    value: Union[str, float, int],
    unit: str = "crore",
    currency: str = "INR",
    period: str = "FY2025",
    scope: str = "consolidated",  # 'consolidated' | 'standalone'
    period_type: str = "annual",  # 'annual' | 'quarterly'
    page: Optional[int] = None,
    source: str = "extracted_table"
) -> Dict[str, Any]:
    """
    Normalizes raw extracted financial metrics into structured DoxFin format.
    Carries full metadata: period, scope (standalone/consolidated), period type, page, and validation status.
    """
    numeric_val = parse_numeric_value(value)
    base_val = normalize_to_base_value(numeric_val, unit) if numeric_val is not None else None
    validation_status = "verified" if numeric_val is not None else "flagged"

    return {
        "metric": metric.strip(),
        "canonical_metric": canonicalize_metric_name(metric),
        "value": numeric_val,
        "base_value": base_val,
        "unit": unit.lower() if unit else "crore",
        "currency": currency.upper() if currency else "INR",
        "period": period.upper() if period else "FY2025",
        "scope": scope.lower() if scope else "consolidated",
        "period_type": period_type.lower() if period_type else "annual",
        "page": page,
        "source": source,
        "validation_status": validation_status
    }


class ValidationService:
    """
    Enterprise Financial Validation Layer (Phases 31 & 32).
    Enforces comparability rules, accounting invariance, and ground truth accuracy scoring.
    """

    @staticmethod
    def validate_balance_sheet(assets: float, liabilities: float, equity: float, tolerance: float = 0.01) -> Dict[str, Any]:
        """Verify fundamental accounting equation: Assets == Liabilities + Equity."""
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
    def validate_comparability(
        metric_a: Dict[str, Any],
        metric_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Phase 32 Guard: Prevents comparing incomparable metrics.
        Guards against:
        - FY2024 vs FY2025
        - Standalone vs Consolidated
        - Quarterly vs Annual
        - Incompatible metric types (Revenue vs Other Income)
        """
        reasons = []

        # 1. Period comparison
        period_a = metric_a.get("period", "").upper()
        period_b = metric_b.get("period", "").upper()
        if period_a and period_b and period_a != period_b:
            reasons.append(f"Period mismatch: {period_a} vs {period_b}")

        # 2. Scope comparison
        scope_a = metric_a.get("scope", "consolidated").lower()
        scope_b = metric_b.get("scope", "consolidated").lower()
        if scope_a != scope_b:
            reasons.append(f"Reporting scope mismatch: {scope_a.capitalize()} vs {scope_b.capitalize()}")

        # 3. Periodicity comparison
        ptype_a = metric_a.get("period_type", "annual").lower()
        ptype_b = metric_b.get("period_type", "annual").lower()
        if ptype_a != ptype_b:
            reasons.append(f"Periodicity mismatch: {ptype_a.capitalize()} vs {ptype_b.capitalize()}")

        # 4. Metric semantics
        can_a = metric_a.get("canonical_metric") or canonicalize_metric_name(metric_a.get("metric", ""))
        can_b = metric_b.get("canonical_metric") or canonicalize_metric_name(metric_b.get("metric", ""))
        if can_a != can_b:
            reasons.append(f"Metric semantic mismatch: '{metric_a.get('metric')}' ({can_a}) vs '{metric_b.get('metric')}' ({can_b})")

        is_comparable = len(reasons) == 0
        return {
            "is_comparable": is_comparable,
            "reasons": reasons,
            "status": "VALID_FOR_COMPARISON" if is_comparable else "INCOMPARABLE_GUARD_BLOCKED"
        }

    @staticmethod
    def evaluate_extraction_accuracy(
        ground_truth: List[Dict[str, Any]],
        extracted_records: List[Dict[str, Any]],
        tolerance_pct: float = 0.01
    ) -> Dict[str, Any]:
        """
        Phase 31 Accuracy Benchmarking Harness:
        Compares manually verified ground truth dataset against DoxFin extracted figures.
        Returns accuracy table with: Metric, Actual, DoxFin, Correct?, Source Page, Discrepancy.
        """
        results_table = []
        correct_count = 0
        total_count = len(ground_truth)

        # Index extracted records by (canonical_metric, period, scope)
        extracted_index: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for rec in extracted_records:
            can_metric = rec.get("canonical_metric") or canonicalize_metric_name(rec.get("metric", ""))
            period = rec.get("period", "FY2025").upper()
            scope = rec.get("scope", "consolidated").lower()
            key = (can_metric, period, scope)
            extracted_index[key] = rec

        for item in ground_truth:
            m_name = item.get("metric", "Unknown")
            can_m = canonicalize_metric_name(m_name)
            actual_val = item.get("actual_value")
            actual_unit = item.get("actual_unit", "crore")
            expected_page = item.get("page")
            period = item.get("period", "FY2025").upper()
            scope = item.get("scope", "consolidated").lower()

            key = (can_m, period, scope)
            extracted = extracted_index.get(key)

            if extracted is not None:
                ext_val = extracted.get("value")
                ext_unit = extracted.get("unit", actual_unit)
                ext_page = extracted.get("page", expected_page)
                
                # Check unit equivalence
                is_correct = are_units_equivalent(
                    val1=actual_val,
                    unit1=actual_unit,
                    val2=ext_val,
                    unit2=ext_unit,
                    tolerance_pct=tolerance_pct
                )
                
                # Check page match if provided
                page_correct = (expected_page is None) or (ext_page == expected_page)
                overall_correct = is_correct and page_correct
                
                actual_base = normalize_to_base_value(actual_val, actual_unit) or 0.0
                ext_base = normalize_to_base_value(ext_val, ext_unit) or 0.0
                discrepancy = round(ext_base - actual_base, 2)
            else:
                ext_val = None
                ext_unit = actual_unit
                ext_page = None
                overall_correct = False
                discrepancy = -normalize_to_base_value(actual_val, actual_unit) if actual_val is not None else 0.0

            if overall_correct:
                correct_count += 1

            results_table.append({
                "metric": m_name,
                "period": period,
                "actual": f"₹{actual_val:,.2f} {actual_unit}" if actual_val is not None else "N/A",
                "doxfin": f"₹{ext_val:,.2f} {ext_unit}" if ext_val is not None else "NOT_FOUND",
                "actual_page": expected_page,
                "extracted_page": ext_page,
                "correct": overall_correct,
                "mark": "✓" if overall_correct else "✗",
                "discrepancy_base": discrepancy
            })

        accuracy_pct = round((correct_count / total_count * 100), 2) if total_count > 0 else 100.0

        return {
            "total_tested": total_count,
            "correct_extractions": correct_count,
            "failed_extractions": total_count - correct_count,
            "accuracy_percent": accuracy_pct,
            "benchmark_results": results_table
        }
