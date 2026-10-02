from typing import Dict, Any, Optional, Tuple, List
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.pipeline_options import PdfPipelineOptions, RapidOcrOptions

# Default converter for standard extraction without OCR
converter_standard = DocumentConverter()

# Converter configured with RapidOCR for selective OCR pages
pipeline_options_ocr = PdfPipelineOptions()
pipeline_options_ocr.do_ocr = True
pipeline_options_ocr.ocr_options = RapidOcrOptions()

converter_ocr = DocumentConverter(
    format_options={
        "pdf": PdfFormatOption(pipeline_options=pipeline_options_ocr)
    }
)


def process_with_docling(
    file_path: str,
    page_range: Optional[Tuple[int, int]] = None,
    max_num_pages: Optional[int] = None,
    needs_ocr: bool = False
) -> Dict[str, Any]:
    """
    Process PDF with Docling selectively.
    Falls back to PyMuPDF table extraction if Docling encounters non-standard or minimal PDF fixtures.
    """
    try:
        converter = converter_ocr if needs_ocr else converter_standard

        kwargs: Dict[str, Any] = {}
        if page_range:
            kwargs["page_range"] = page_range
        if max_num_pages:
            kwargs["max_num_pages"] = max_num_pages

        result = converter.convert(file_path, **kwargs)

        return {
            "markdown": result.document.export_to_markdown(),
            "page_range": page_range,
            "used_ocr": needs_ocr
        }
    except Exception:
        # Graceful PyMuPDF table/text fallback
        import pymupdf
        doc = pymupdf.open(file_path)
        p_start = (page_range[0] - 1) if page_range else 0
        p_end = page_range[1] if page_range else len(doc)
        md_chunks = []
        for p_idx in range(max(0, p_start), min(len(doc), p_end)):
            page = doc[p_idx]
            tabs = page.find_tables()
            if tabs.tables:
                for t in tabs.tables:
                    df = t.extract()
                    if df:
                        headers = [str(c) if c else "" for c in df[0]]
                        header_line = "| " + " | ".join(headers) + " |"
                        sep_line = "| " + " | ".join(["---"] * len(headers)) + " |"
                        rows = ["| " + " | ".join([str(c) if c else "" for c in row]) + " |" for row in df[1:]]
                        md_chunks.append("\n".join([header_line, sep_line] + rows))
            else:
                md_chunks.append(page.get_text("text"))
        doc.close()
        return {
            "markdown": "\n\n".join(md_chunks),
            "page_range": page_range,
            "used_ocr": False
        }

