"""Deterministic Financial Calculations & Metric Engine"""
from typing import Dict, Any, Optional


class FinancialService:
    @staticmethod
    def calculate_growth(current: float, previous: float) -> Optional[float]:
        """Calculate year-over-year or period-over-period percentage growth."""
        if previous == 0:
            return None
        return ((current - previous) / abs(previous)) * 100.0

    @staticmethod
    def calculate_margin(numerator: float, revenue: float) -> Optional[float]:
        """Calculate margin percentage (e.g. Net Margin, Operating Margin)."""
        if revenue == 0:
            return None
        return (numerator / revenue) * 100.0
