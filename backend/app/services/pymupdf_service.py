import pymupdf


def inspect_pdf(pdf_path: str):
    doc = pymupdf.open(pdf_path)
    pages = []

    for index, page in enumerate(doc):
        text = page.get_text("text")
        images = page.get_images(full=True)
        tables = page.find_tables()
        
        table_markdown_blocks = []
        if tables.tables:
            for t in tables.tables:
                try:
                    df = t.extract()
                    if df and len(df) > 0:
                        headers = [str(c).strip() if c is not None else "" for c in df[0]]
                        header_line = "| " + " | ".join(headers) + " |"
                        sep_line = "| " + " | ".join(["---"] * len(headers)) + " |"
                        rows = ["| " + " | ".join([str(c).strip() if c is not None else "" for c in row]) + " |" for row in df[1:]]
                        table_markdown_blocks.append("\n".join([header_line, sep_line] + rows))
                except Exception:
                    pass

        table_md_text = "\n\n".join(table_markdown_blocks)

        pages.append({
            "page_number": index + 1,
            "text": text,
            "table_markdown": table_md_text,
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