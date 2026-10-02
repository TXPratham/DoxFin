import pymupdf


def inspect_pdf(pdf_path: str):

    doc = pymupdf.open(pdf_path)

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
            "table_count": len(tables.tables),
            "needs_ocr": len(text.strip()) < 50
        })

    result = {
        "page_count": len(doc),
        "pages": pages
    }

    doc.close()

    return result