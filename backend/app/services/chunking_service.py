"""Document Chunking Service for RAG Preparation (Phase 12)"""
import re
from typing import Dict, Any, List, Optional


FINANCIAL_SECTIONS = [
    "Consolidated Statement of Profit and Loss",
    "Balance Sheet",
    "Statement of Cash Flows",
    "Notes to Financial Statements",
    "Segment Reporting",
    "Directors' Report",
    "Management Discussion and Analysis"
]


def detect_section_title(text: str) -> str:
    """Detect section title from page text or markdown headings."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return "General Content"

    # Check for Markdown headers (e.g., '# Title' or '## Section')
    for line in lines[:5]:
        if line.startswith("#"):
            clean_title = re.sub(r"^#+\s*", "", line)
            return clean_title

    # Check for explicit financial section names
    for line in lines[:5]:
        for sec in FINANCIAL_SECTIONS:
            if sec.lower() in line.lower():
                return sec

    # Default to first non-empty header line
    return lines[0][:80]


def infer_source_type(section_title: str, text: str) -> str:
    """Infer the source category of the chunk."""
    lower_title = section_title.lower()
    lower_text = text.lower()

    if any(k in lower_title or k in lower_text for k in ["balance sheet", "profit and loss", "cash flow", "income statement"]):
        return "financial_statement"
    elif "notes" in lower_title or "accounting policies" in lower_text:
        return "notes"
    elif "segment" in lower_title or "segment reporting" in lower_text:
        return "segment_reporting"
    elif "management" in lower_title or "directors" in lower_title:
        return "management_discussion"
    return "general_text"


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100
) -> List[str]:
    """
    Split text into logical paragraph or sliding window chunks.
    Preserves paragraph breaks where possible.
    """
    if not text or not text.strip():
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para)
        if current_len + para_len > chunk_size and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            # Sliding overlap
            overlap_text = current_chunk[-1] if current_chunk else ""
            current_chunk = [overlap_text, para] if len(overlap_text) <= chunk_overlap else [para]
            current_len = sum(len(p) for p in current_chunk)
        else:
            current_chunk.append(para)
            current_len += para_len

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks if chunks else [text]


def create_document_chunks(
    pages: List[Dict[str, Any]],
    document_id: str = "doc1",
    chunk_size: int = 500,
    chunk_overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Chunk parsed pages into structured RAG payloads carrying precise metadata.

    Output format per chunk:
    {
        "chunk_id": "doc1_p146_c2",
        "document_id": "doc1",
        "page": 146,
        "section": "Consolidated Statement of Profit and Loss",
        "text": "Revenue from operations increased...",
        "source_type": "financial_statement"
    }
    """
    all_chunks: List[Dict[str, Any]] = []

    for page in pages:
        page_num = page.get("page_number", 1)
        raw_text = page.get("text", "")
        table_md = page.get("markdown") or page.get("table_markdown", "")

        # Combine table markdown and body text so financial figures are not lost
        content_parts = []
        if table_md and table_md.strip():
            content_parts.append(table_md.strip())
        if raw_text and raw_text.strip():
            # If table markdown is not already containing the raw text
            if not table_md or raw_text.strip() not in table_md:
                content_parts.append(raw_text.strip())

        content_text = "\n\n".join(content_parts) if content_parts else f"Page {page_num}: Consolidated Financial Statements and Disclosures"

        section = detect_section_title(content_text)
        source_type = infer_source_type(section, content_text)
        text_chunks = chunk_text(content_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

        for c_idx, chunk_txt in enumerate(text_chunks, start=1):
            chunk_id = f"{document_id}_p{page_num}_c{c_idx}"
            chunk_payload = {
                "chunk_id": chunk_id,
                "document_id": document_id,
                "page": page_num,
                "page_number": page_num,
                "section": section,
                "text": chunk_txt,
                "source_type": source_type,
                "financial_score": page.get("financial_score", 0),
                "needs_ocr": page.get("needs_ocr", False)
            }
            all_chunks.append(chunk_payload)

    return all_chunks
