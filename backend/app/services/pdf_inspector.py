import pymupdf
import time
from typing import List, Dict, Any


def inspect_pdf(pdf_path: str) -> List[Dict[str, Any]]:
    start = time.perf_counter()

    doc = pymupdf.open(pdf_path)
    pages = []

    for page_index, page in enumerate(doc):
        text = page.get_text("text")
        images = page.get_images(full=True)
        words = page.get_text("words")

        pages.append({
            "page": page_index + 1,
            "page_index": page_index,
            "text": text,
            "text_length": len(text),
            "word_count": len(words),
            "image_count": len(images),
        })

    doc.close()

    elapsed = time.perf_counter() - start

    print("\n========== PYMUPDF FAST PASS ==========")
    print(f"Pages scanned : {len(pages)}")
    print(f"Time          : {elapsed:.2f} seconds")
    print("=======================================\n")

    return pages
