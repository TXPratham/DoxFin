import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.embedding_service import create_embeddings
from app.services.faiss_service import FaissStore, save_document_store
from app.services.rag_service import (
    RAGService,
    retrieve_context,
    build_rag_prompt
)

print("=" * 70)
print("Phase 17: RAG Retrieval & Selective Context Pipeline Test")
print("=" * 70)

# 1. Simulate a large 500-page document with diverse pages
simulated_document_chunks = [
    {
        "chunk_id": "doc500_p10",
        "document_id": "doc500",
        "page_number": 10,
        "section": "Chairman's Statement",
        "source_type": "management_discussion",
        "text": "We are proud of our ongoing commitments to green sustainability and global community support initiatives."
    },
    {
        "chunk_id": "doc500_p82",
        "document_id": "doc500",
        "page_number": 82,
        "section": "Management Discussion and Analysis",
        "source_type": "management_discussion",
        "text": "Operating cash flow faced temporary headwinds during the second half due to upfront customer procurement cycles and elevated inventory levels."
    },
    {
        "chunk_id": "doc500_p151",
        "document_id": "doc500",
        "page_number": 151,
        "section": "Statement of Cash Flows",
        "source_type": "financial_statement",
        "text": "Cash generated from operating activities decreased from $680 million to $540 million, primarily driven by working capital adjustments."
    },
    {
        "chunk_id": "doc500_p178",
        "document_id": "doc500",
        "page_number": 178,
        "section": "Notes - Trade Receivables",
        "source_type": "notes",
        "text": "Trade receivables increased by 28% to $420 million, leading to lengthened collection periods and customer delayed remittances."
    },
    {
        "chunk_id": "doc500_p190",
        "document_id": "doc500",
        "page_number": 190,
        "section": "Notes - Working Capital",
        "source_type": "notes",
        "text": "Working capital changes resulted in an outflow of $165 million compared to an inflow of $40 million in the prior fiscal year."
    },
    {
        "chunk_id": "doc500_p310",
        "document_id": "doc500",
        "page_number": 310,
        "section": "Corporate Governance & Board",
        "source_type": "general_text",
        "text": "The Board of Directors held 6 meetings during the year with 100% committee attendance across all independent directors."
    },
    {
        "chunk_id": "doc500_p450",
        "document_id": "doc500",
        "page_number": 450,
        "section": "Shareholder Notice & AGM",
        "source_type": "general_text",
        "text": "The 32nd Annual General Meeting will be held via electronic video conferencing on September 15th."
    }
]

# 2. Index all chunks into FAISS
print(f"\n1. Indexing {len(simulated_document_chunks)} chunks from 500-page simulated report...")
texts = [c["text"] for c in simulated_document_chunks]
embeddings = create_embeddings(texts)
dimension = embeddings.shape[1] if hasattr(embeddings, "shape") else len(embeddings[0])

store = FaissStore(dimension=dimension)
store.add(embeddings=embeddings, metadata=simulated_document_chunks)
print(f"   Indexed {store.index.ntotal} vectors successfully.")

# 3. User asks the exact query from Phase 17
user_query = "Why did operating cash flow decrease?"
print(f"\n2. User Query: '{user_query}'")

# 4. RAG Retrieval Step
print("\n3. Retrieving top 4 relevant chunks via RAG...")
retrieved = retrieve_context(user_query, store, top_k=4)

print("\n--- RETRIEVED SELECTIVE CHUNKS ---")
retrieved_pages = []
for i, chunk in enumerate(retrieved, 1):
    retrieved_pages.append(chunk["page_number"])
    print(f"[{i}] Page {chunk['page_number']} | {chunk['section']} | Score: {chunk['score']:.4f}")
    print(f"    Snippet: {chunk['text']}")

# Verify that relevant pages are retrieved and governance/AGM/ESG pages are filtered out
assert 151 in retrieved_pages or 82 in retrieved_pages, "Cash flow related pages should be retrieved!"
assert 310 not in retrieved_pages, "Irrelevant governance page 310 should not be retrieved!"
assert 450 not in retrieved_pages, "Irrelevant AGM page 450 should not be retrieved!"

# 5. Build strict citation LLM prompt
print("\n4. Building LLM Prompt with strictly selective context:")
prompt = build_rag_prompt(user_query, retrieved)
print("-" * 60)
print(prompt)
print("-" * 60)

# 6. Test RAGService orchestrator
print("\n5. Testing full RAGService execution...")
rag_result = RAGService.query_document(user_query, store, top_k=4)
print(f"Query: {rag_result['query']}")
print(f"Retrieved Chunks Count: {rag_result['retrieved_chunks_count']}")
print(f"Citations: {rag_result['citations']}")
print(f"Generated Explanation: {rag_result['answer']}")

print("\n>>> Phase 17 RAG Test Passed Successfully! <<<")
