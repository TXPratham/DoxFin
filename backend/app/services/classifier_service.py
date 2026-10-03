FINANCIAL_KEYWORDS = [
    "revenue",
    "profit",
    "loss",
    "balance sheet",
    "cash flow",
    "financial statements",
    "assets",
    "liabilities",
    "equity",
    "borrowings",
    "debt",
    "receivables",
    "payables",
    "expenses",
    "tax",
    "taxation",
    "income tax",
    "depreciation",
    "ebitda",
    "segment",
    "operating margin",
    "working capital"
]


def classify_page(page):

    text = page["text"].lower()

    keyword_score = sum(
        1 for keyword in FINANCIAL_KEYWORDS
        if keyword in text
    )

    return {
        **page,

        "financial_score": keyword_score,

        "use_docling":
            page["table_count"] > 0
            or keyword_score >= 3,

        "use_vision":
            page["image_count"] > 0
            and keyword_score >= 2,

        "use_ocr":
            page["needs_ocr"]
    }
