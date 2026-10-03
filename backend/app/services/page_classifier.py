import re
from typing import Dict, Any, Set


FINANCIAL_KEYWORDS: Set[str] = {
    "revenue",
    "income",
    "profit",
    "loss",
    "assets",
    "liabilities",
    "equity",
    "cash flow",
    "cash flows",
    "receivables",
    "borrowings",
    "debt",
    "expenses",
    "ebitda",
    "balance sheet",
    "financial position",
    "statement of profit",
    "statement of income",
    "statement of cash",
    "shareholders",
    "segment revenue",
    "operating profit",
    "net profit",
    "current assets",
    "current liabilities",
}

CHART_KEYWORDS: Set[str] = {
    "revenue growth",
    "profit growth",
    "segment revenue",
    "market share",
    "debt",
    "cash flow",
    "financial performance",
    "year-on-year",
    "yoy",
    "cagr",
    "ebitda",
    "margin",
}


def numeric_density(text: str) -> float:
    if not text:
        return 0.0

    tokens = text.split()

    if not tokens:
        return 0.0

    numeric_tokens = sum(
        1
        for token in tokens
        if re.search(r"\d", token)
    )

    return numeric_tokens / len(tokens)


def keyword_score(text: str, keywords: Set[str]) -> int:
    lower_text = text.lower()

    return sum(
        1
        for keyword in keywords
        if keyword in lower_text
    )


def classify_page(page_info: Dict[str, Any]) -> Dict[str, Any]:
    text = page_info["text"]
    text_length = page_info["text_length"]
    image_count = page_info["image_count"]

    financial_score = keyword_score(
        text,
        FINANCIAL_KEYWORDS
    )

    chart_score = keyword_score(
        text,
        CHART_KEYWORDS
    )

    number_ratio = numeric_density(text)

    # Likely financial table
    if financial_score >= 2 and number_ratio >= 0.20:
        route = "financial_table"

    # Likely financially relevant visual/chart
    elif image_count > 0 and chart_score >= 1:
        route = "financial_chart"

    # Ordinary useful text
    elif text_length >= 150:
        route = "text"

    # Very little useful content
    else:
        route = "irrelevant"

    return {
        **page_info,
        "route": route,
        "financial_score": financial_score,
        "chart_score": chart_score,
        "numeric_density": round(number_ratio, 3),
    }
