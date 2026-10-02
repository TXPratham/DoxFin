import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.embedding_service import create_embeddings
from app.services.faiss_service import (
    FaissStore,
    save_document_store,
    load_document_store
)

print("=" * 60)
print("Phase 15 & 16: FAISS Index Creation, Search & Persistence Test")
print("=" * 60)

# 1. Sample document chunks representing financial report sections
chunks = [
    {
        "chunk_id": "doc_123_chunk_0",
        "document_id": "doc_123",
        "page_number": 1,
        "page_type": "text",
        "text": "The company reported total consolidated revenue of $4.85 billion in FY2024, representing a 14.2% YoY growth.",
    },
    {
        "chunk_id": "doc_123_chunk_1",
        "document_id": "doc_123",
        "page_number": 2,
        "page_type": "financial_statement",
        "text": "Operating margin improved from 18.5% to 21.3%, driven by operational efficiency and reduced SG&A expenses.",
    },
    {
        "chunk_id": "doc_123_chunk_2",
        "document_id": "doc_123",
        "page_number": 3,
        "page_type": "financial_statement",
        "text": "Free Cash Flow stood at $820 million, enabling share repurchases of $300 million and dividend payouts.",
    },
    {
        "chunk_id": "doc_123_chunk_3",
        "document_id": "doc_123",
        "page_number": 4,
        "page_type": "notes",
        "text": "Long-term debt maturities: $250 million due in 2026, with an average effective interest rate of 4.15%.",
    }
]

texts = [c["text"] for c in chunks]

# 2. Generate embeddings
print(f"\n1. Generating embeddings for {len(texts)} chunks using SentenceTransformer...")
embeddings = create_embeddings(texts)
dimension = embeddings.shape[1] if hasattr(embeddings, "shape") else len(embeddings[0])
print(f"   Embeddings shape: {embeddings.shape} (Dimension: {dimension})")

# 3. Create FAISS index and add vectors + metadata
print("\n2. Initializing FaissStore and indexing chunks...")
store = FaissStore(dimension=dimension)
store.add(embeddings=embeddings, metadata=chunks)
print(f"   Total indexed vectors: {store.index.ntotal}")

# 4. Search query
query = "What is the Free Cash Flow and capital return?"
print(f"\n3. Searching for query: '{query}'")
query_vec = create_embeddings([query])[0]
results = store.search(query_vec, k=2)

for i, res in enumerate(results, 1):
    meta = res["metadata"]
    print(f"   Rank {i} [Score: {res['score']:.4f}]: (Page {meta['page_number']}) {meta['text']}")

# 5. Phase 16: Save to vector_store
vector_store_dir = backend_dir / "vector_store"
doc_id = "doc_123"
print(f"\n4. Saving FAISS index and metadata for '{doc_id}' into '{vector_store_dir}'...")
saved_paths = save_document_store(store, doc_id=doc_id, vector_store_dir=vector_store_dir)
print(f"   Index saved to:    {saved_paths['index_path']}")
print(f"   Metadata saved to: {saved_paths['metadata_path']}")

# 6. Load from vector_store and verify search
print(f"\n5. Loading index back from disk to verify persistence...")
loaded_store = load_document_store(doc_id=doc_id, vector_store_dir=vector_store_dir)
print(f"   Loaded index total vectors: {loaded_store.index.ntotal}")
print(f"   Loaded metadata items:      {len(loaded_store.metadata)}")

loaded_results = loaded_store.search(query_vec, k=2)
print("\n6. Search results from loaded index:")
for i, res in enumerate(loaded_results, 1):
    meta = res["metadata"]
    print(f"   Rank {i} [Score: {res['score']:.4f}]: (Page {meta['page_number']}) {meta['text']}")

assert len(loaded_results) == len(results), "Results count mismatch!"
assert loaded_results[0]["metadata"]["chunk_id"] == results[0]["metadata"]["chunk_id"], "Top result mismatch!"
print("\n>>> Phase 15 & 16 Test Passed Successfully! <<<")
