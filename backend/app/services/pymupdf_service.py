import os

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf


def inspect_pdf(pdf_path: str):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at path: '{pdf_path}'")

    with pymupdf.open(pdf_path) as doc:
        pages = []

        for index, page in enumerate(doc):
            text = page.get_text("text")
            images = page.get_images(full=True)
            tables = page.find_tables()

            pages.append({
                "page_number": index + 1,
                "text": text,
                "text_length": len(text),
                "image_count": len(images),
                "table_count": len(tables.tables) if tables and hasattr(tables, "tables") and tables.tables else 0,
                "needs_ocr": len(text.strip()) < 50
            })

        result = {
            "page_count": doc.page_count,
            "pages": pages
        }

    return result
