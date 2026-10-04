"""
DoxFin AI Test Harness
Executes queries against /api/v1/documents/{doc_id}/query and displays answers and citations.
"""
import urllib.request
import json
import time

def test_query(doc_id: str, query: str):
    print("\n" + "=" * 75)
    print(f"TEST QUERY: '{query}'")
    print("=" * 75)
    
    t0 = time.time()
    body = json.dumps({"query": query, "top_k": 5}).encode("utf-8")
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/v1/documents/{doc_id}/query",
        data=body,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            elapsed = time.time() - t0
            print(f"Elapsed: {elapsed:.2f}s | Status: 200 OK")
            print("-" * 75)
            print("DOXFIN AI ANSWER:")
            print(data.get("answer"))
            print("-" * 75)
            citations = data.get("citations", [])
            print(f"GROUNDED CITATIONS ({len(citations)} sources):")
            for i, c in enumerate(citations, 1):
                p = c.get("page_number")
                sc = c.get("score")
                st = c.get("source_type")
                sec = c.get("section", "")
                snip = c.get("text_snippet", "")[:120].replace("\n", " ")
                print(f"  [{i}] Page {p} (Score: {sc}, Type: {st}) | Sec: {sec[:30]}")
                print(f"      Snippet: {snip}...")
    except urllib.error.HTTPError as e:
        print(f"HTTP ERROR: {e.code} - {e.read().decode('utf-8')}")
    except Exception as ex:
        print(f"ERROR: {ex}")

if __name__ == "__main__":
    doc_id = "doc_1791047998966"
    test_queries = [
        "What was the total net revenue and how did it change from 2023 to 2024?",
        "What are the total borrowings and debt breakdown?",
        "What was the revenue of Tesla in 1982?"  # Negative / Out-of-scope test
    ]
    for q in test_queries:
        test_query(doc_id, q)
