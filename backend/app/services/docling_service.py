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

    - page_range: Tuple of (start_page, end_page), e.g. (1, 10). Avoids scanning 500 pages.
    - needs_ocr: If True, uses RapidOCR engine for image/scanned pages.
    """
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
