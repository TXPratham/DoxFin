"""Validation Service for extracted financial figures (Assets = Liabilities + Equity, etc.)"""
from typing import Dict, Any


class ValidationService:
    @staticmethod
    def validate_balance_sheet(assets: float, liabilities: float, equity: float, tolerance: float = 0.01) -> bool:
        """
        Verify accounting equation: Assets == Liabilities + Equity
        """
        return abs(assets - (liabilities + equity)) <= tolerance
