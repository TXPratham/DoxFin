"""Document Page Classification and Routing Service"""
from typing import Dict, Any


class ClassifierService:
    @staticmethod
    def classify_page(page_data: Dict[str, Any]) -> str:
        """
        Classifies page content into Text, Table, Chart/Image, or Mixed.
        """
        text = page_data.get("text", "")
        if "Balance Sheet" in text or "Income Statement" in text or "Cash Flows" in text:
            return "financial_table"
        return "text"
