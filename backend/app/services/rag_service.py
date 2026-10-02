"""
RAG Service for evidence-backed financial queries and citations (Phase 17).
Implements selective context retrieval (5 targeted chunks rather than 500 pages)
and builds citation-grounded prompts for LLM synthesis.
"""
from typing import Dict, Any, List, Optional, Callable, Union
import numpy as np

from app.services.embedding_service import create_embeddings
from app.services.faiss_service import FaissStore, load_document_store


def retrieve_context(
    query: str,
    faiss_store: FaissStore,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Step 1 & 2 of Phase 17:
    1. Embed user financial query with SentenceTransformer (normalized).
    2. Retrieve top-k most relevant evidence chunks from FAISS index.
    """
    # 1. Encode query
    query_embeddings = create_embeddings([query])
    query_vector = query_embeddings[0]

    # 2. Search FAISS index
    search_results = faiss_store.search(query_vector, k=top_k)

    retrieved = []
    for item in search_results:
        metadata = item.get("metadata", {})
        retrieved.append({
            "score": item.get("score", 0.0),
            "chunk_id": metadata.get("chunk_id", ""),
            "document_id": metadata.get("document_id", ""),
            "page_number": metadata.get("page_number", metadata.get("page", 1)),
            "section": metadata.get("section", "General Content"),
            "source_type": metadata.get("source_type", "general_text"),
            "text": metadata.get("text", "")
        })

    return retrieved


def format_context_for_llm(retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Format selected evidence chunks into a clean, structured context block for the LLM.
    """
    if not retrieved_chunks:
        return "No relevant financial context found in document."

    context_blocks = []
    for i, chunk in enumerate(retrieved_chunks, start=1):
        block = (
            f"[Source {i} | Page {chunk['page_number']} | Section: {chunk['section']}]\n"
            f"{chunk['text'].strip()}"
        )
        context_blocks.append(block)

    return "\n\n---\n\n".join(context_blocks)


def build_rag_prompt(query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Construct institutional financial analyst prompt enforcing strict citation grounding.
    """
    context_str = format_context_for_llm(retrieved_chunks)

    prompt = f"""You are DoxFin's Quantitative Financial Analysis Engine.
Answer the user's financial question STRICTLY using the retrieved context provided below.

RULES:
1. Ground every claim with exact citations in the format [Page X, Section Name].
2. If the answer is not supported by the retrieved context, state clearly that the information is not present in the referenced sections.
3. Financial calculations and facts must be deterministic and verifiable from the evidence.
4. Do NOT speculate or hallucinate outside the given text.

=== RETRIEVED FINANCIAL EVIDENCE ===
{context_str}
====================================

User Question: {query}

Financial Analysis & Evidence-Backed Answer:"""
    return prompt


class RAGService:
    """
    RAG Pipeline orchestrator for financial documents.
    """

    @classmethod
    def query_document(
        cls,
        query: str,
        faiss_store: FaissStore,
        top_k: int = 5,
        llm_fn: Optional[Callable[[str], str]] = None
    ) -> Dict[str, Any]:
        """
        Execute full RAG flow:
        Question -> Embedding -> FAISS retrieval -> Context Assembly -> LLM Explanation.
        """
        # Retrieve selective chunks
        chunks = retrieve_context(query, faiss_store, top_k=top_k)

        # Build prompt
        prompt = build_rag_prompt(query, chunks)

        # Generate answer (via provided LLM function, or deterministic explanation synthesis)
        if llm_fn is not None:
            answer = llm_fn(prompt)
        else:
            # Deterministic fallback summary when no LLM API key is wired
            citations_summary = ", ".join([f"Page {c['page_number']} ({c['section']})" for c in chunks])
            answer = (
                f"Retrieved {len(chunks)} relevant sections from the document: {citations_summary}. "
                f"Top evidence source from Page {chunks[0]['page_number'] if chunks else 'N/A'} "
                f"addresses '{query}'."
            )

        citations = [
            {
                "page_number": c["page_number"],
                "section": c["section"],
                "chunk_id": c["chunk_id"],
                "score": round(float(c["score"]), 4),
                "text_snippet": c["text"][:160] + ("..." if len(c["text"]) > 160 else "")
            }
            for c in chunks
        ]

        return {
            "query": query,
            "answer": answer,
            "prompt": prompt,
            "citations": citations,
            "retrieved_chunks_count": len(chunks)
        }

    @classmethod
    def query_by_doc_id(
        cls,
        query: str,
        doc_id: str,
        vector_store_dir: str = "vector_store",
        top_k: int = 5,
        llm_fn: Optional[Callable[[str], str]] = None
    ) -> Dict[str, Any]:
        """
        Load index from vector_store and execute RAG query.
        """
        store = load_document_store(doc_id=doc_id, vector_store_dir=vector_store_dir)
        return cls.query_document(query=query, faiss_store=store, top_k=top_k, llm_fn=llm_fn)
