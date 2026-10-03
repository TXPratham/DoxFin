"""
DoxFin End-to-End RAG Pipeline Test (FAISS + IBM Granite 4.0 1B + Deterministic Metrics Engine).
Demonstrates:
1. Vector Indexing of Multi-Page Financial Disclosures with Page & Section Metadata.
2. Grounded Question Interrogation via FAISS Retrieval + Verified Metrics + Granite 4.0 1B.
3. Upfront Deterministic Evidence Sufficiency Gating (Zero Hallucination Guard).
"""
import sys
from pathlib import Path

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from backend.app.services.faiss_service import FaissStore
from backend.app.services.embedding_service import create_embeddings
from backend.app.services.rag_service import RAGService


def run_pipeline():
    print("=" * 70)
    print("DOXFIN ENTERPRISE RAG PIPELINE: FAISS + IBM GRANITE 4.0 1B")
    print("=" * 70)

    # 1. Initialize FAISS Vector Store
    print("\n1. Initializing FAISS Vector Store for Document: doc_fy2025_report...")
    faiss_store = FaissStore(dimension=384)

    # 2. Add realistic multi-page financial chunks with metadata
    raw_chunks = [
        {
            "chunk_id": "chunk_p112_rev",
            "page_number": 112,
            "section": "Consolidated Statement of Profit and Loss",
            "text": "Revenue from operations for FY2025 grew by 12.4% to ₹16,420 Cr compared to ₹14,600 Cr in FY2024. Net profit expanded by 8.7% to ₹2,180 Cr."
        },
        {
            "chunk_id": "chunk_p151_cfs",
            "page_number": 151,
            "section": "Cash Flow Statement",
            "text": "Operating cash flow declined by 14.2% during FY2025. Net cash generated from operating activities stood at ₹1,870 Cr compared to ₹2,230 Cr in FY2024."
        },
        {
            "chunk_id": "chunk_p178_rec",
            "page_number": 178,
            "section": "Note 17 - Trade Receivables",
            "text": "Trade receivables increased significantly by 23.1% to ₹3,240 Cr during FY2025, driven by extended customer payment cycles in institutional credit segments."
        },
        {
            "chunk_id": "chunk_p82_mda",
            "page_number": 82,
            "section": "Management Discussion & Analysis",
            "text": "Higher working capital requirements and inventory buildup affected cash generation in the latter half of the financial year."
        }
    ]

    print(f"2. Embedding and indexing {len(raw_chunks)} document chunks with SentenceTransformers...")
    texts = [c["text"] for c in raw_chunks]
    embeddings = create_embeddings(texts)
    metadata_list = [
        {
            "chunk_id": chunk["chunk_id"],
            "page_number": chunk["page_number"],
            "section": chunk["section"],
            "text": chunk["text"]
        }
        for chunk in raw_chunks
    ]

    faiss_store.add(embeddings=embeddings, metadata=metadata_list)
    print("   [OK] FAISS Indexing complete.")

    # 3. Verified Financial Engine Metrics
    verified_metrics = [
        {"metric_name": "Revenue Growth", "value": "+12.4", "unit": "%"},
        {"metric_name": "Net Profit Growth", "value": "+8.7", "unit": "%"},
        {"metric_name": "Operating Cash Flow Growth", "value": "-14.2", "unit": "%"},
        {"metric_name": "Trade Receivables Growth", "value": "+23.1", "unit": "%"}
    ]

    # TEST CASE 1: Grounded Question (Evidence Present)
    q1 = "Why did operating cash flow decline?"
    print("\n3. Executing Test Case 1 (Sufficient Evidence):")
    print(f'   Question: "{q1}"')

    res1 = RAGService.query_document(
        query=q1,
        faiss_store=faiss_store,
        top_k=3,
        verified_metrics=verified_metrics
    )

    print("\n   --- Top FAISS Citations Retrieved ---")
    for c in res1["citations"]:
        print(f"   * [Page {c['page_number']} | {c['section']}] (Score: {c['score']})")

    print("\n   --- Grounded Granite Explanation ---")
    print(f"   {res1['answer']}\n")

    # TEST CASE 2: Insufficient Evidence Question
    q2 = "Why did the company acquire another company during FY2025?"
    print("\n4. Executing Test Case 2 (Insufficient Evidence):")
    print(f'   Question: "{q2}"')

    res2 = RAGService.query_document(
        query=q2,
        faiss_store=faiss_store,
        top_k=3,
        min_threshold=0.45,
        verified_metrics=verified_metrics
    )

    print(f"   Status: {res2['status']}")
    print(f"   Answer: {res2['answer']}")
    print(f"   Has Sufficient Evidence: {res2['has_sufficient_evidence']}")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
