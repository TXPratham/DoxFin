"""
RAG Service & Evaluation Harness for Financial Documents (Phases 33 & 34).
Implements:
1. Evidence Sufficiency Verification ("I don't have enough evidence" guard).
2. Grounded Citation Extraction with Source Page & Section Numbers.
3. 3-Pillar RAG Benchmark Evaluator (Answer Accuracy, Evidence Retrieved, Page Reference Correctness).
"""
import re
from typing import Dict, Any, List, Optional, Callable, Tuple
import numpy as np

from app.services.embedding_service import create_embeddings
from app.services.faiss_service import FaissStore, load_document_store

# Minimum FAISS cosine similarity / dot product threshold for evidence sufficiency
MIN_EVIDENCE_THRESHOLD = 0.38

# Strict Fallback Phrase required by Phase 34 & Step 9/10
INSUFFICIENT_EVIDENCE_MESSAGE = "The uploaded report does not provide sufficient evidence to answer this question."


ADVERSARIAL_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)",
    r"you\s+are\s+now\s+(in\s+)?(developer\s+mode|dan|jailbreak)",
    r"(reveal|output|display|show|print|leak)\s+(the\s+)?(initial\s+|original\s+)?(system\s+)?(prompt|instructions|rules|secret|password)",
    r"<script[\s>]",
    r"javascript:",
    r"drop\s+table\s+",
    r"union\s+select\s+"
]


def check_prompt_safety(query: str) -> Tuple[bool, Optional[str]]:
    """Guards against adversarial prompt injection and jailbreak attempts."""
    q_lower = query.lower()
    for pat in ADVERSARIAL_INJECTION_PATTERNS:
        if re.search(pat, q_lower):
            return False, "Security Guard: Adversarial instruction or prompt injection pattern detected. Query rejected under DoxFin compliance protocols."
    return True, None


def retrieve_context(
    query: str,
    faiss_store: FaissStore,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    1. Embed user financial query with SentenceTransformer (normalized).
    2. Retrieve top-k most relevant evidence chunks from FAISS index.
    """
    query_embeddings = create_embeddings([query])
    query_vector = query_embeddings[0]

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


def is_evidence_sufficient(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    threshold: float = MIN_EVIDENCE_THRESHOLD
) -> Tuple[bool, str]:
    """
    Phase 34 Evidence Sufficiency Gate:
    Determines if retrieved evidence is adequate to answer the question deterministically before calling LLM.
    """
    if not retrieved_chunks:
        return False, "No chunks retrieved from vector store."

    top_score = max((c.get("score", 0.0) for c in retrieved_chunks), default=0.0)

    # 1. Check for specific queried years (e.g. 1982, 2035, 2040)
    queried_years = re.findall(r"\b(19\d\d|20[3-9]\d)\b", query)
    if queried_years:
        chunk_texts = " ".join([c.get("text", "") for c in retrieved_chunks])
        if not any(yr in chunk_texts for yr in queried_years):
            return False, f"Query asks about year {queried_years[0]} not found in document context."

    # 2. Score threshold check
    if top_score < threshold:
        return False, f"Top relevance score ({top_score:.4f}) is below confidence threshold ({threshold:.4f})."

    # 3. Key entity / subject presence check
    # Stop words to ignore when extracting salient terms from the query
    stop_words = {
        "what", "why", "how", "when", "where", "which", "who", "whom", "whose",
        "did", "does", "do", "is", "are", "was", "were", "has", "have", "had",
        "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "from",
        "by", "with", "about", "during", "of", "company", "explain", "describe",
        "give", "tell", "detail", "details", "show", "summarize", "analyze"
    }
    raw_terms = re.findall(r"[a-zA-Z]{3,}", query.lower())
    query_keywords = [t for t in raw_terms if t not in stop_words]

    if query_keywords:
        all_chunk_text = " ".join([c.get("text", "").lower() for c in retrieved_chunks])
        # Find if at least one meaningful keyword/stem is present in the retrieved chunks
        matched_keywords = [kw for kw in query_keywords if kw in all_chunk_text or any(kw.rstrip('s') in word for word in all_chunk_text.split())]
        
        # If none of the specific query keywords are present anywhere in the retrieved chunks, reject
        if not matched_keywords and top_score < 0.65:
            return False, f"Core query topics ({', '.join(query_keywords[:3])}) not found in retrieved document evidence."

    return True, "Sufficient evidence available."


def format_context_for_llm(retrieved_chunks: List[Dict[str, Any]]) -> str:
    """Format selected evidence chunks into a clean, structured context block for the LLM."""
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


def format_rag_prompt_for_granite(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    verified_metrics: Optional[List[Dict[str, Any]]] = None
) -> str:
    """Format query, verified financial metrics, and retrieved evidence chunks for Granite 4.0 1B."""
    metrics_block = ""
    if verified_metrics:
        lines = []
        for m in verified_metrics:
            name = m.get("metric_name", "Metric")
            val = m.get("value", "")
            unit = m.get("unit", "")
            lines.append(f"{name}: {val}{unit}")
        metrics_block = "VERIFIED FINANCIAL METRICS\n\n" + "\n".join(lines) + "\n\n"

    evidence_block = "DOCUMENT EVIDENCE\n\n"
    chunk_lines = []
    for chunk in retrieved_chunks:
        page = chunk.get("page_number", 1)
        sec = chunk.get("section", "Disclosure")
        src_type = chunk.get("source_type", "text")
        text = chunk.get("text", "").strip()
        type_tag = " [FINANCIAL TABLE]" if src_type == "table" or "|" in text else ""
        chunk_lines.append(f"[Page {page} - {sec}{type_tag}]\n{text}")
    evidence_block += "\n\n".join(chunk_lines)

    user_prompt = f"""USER QUESTION:
{query}

{metrics_block}{evidence_block}

INSTRUCTIONS:
1. Answer the user's question directly, clearly, and thoroughly using only the supplied document evidence and verified financial metrics.
2. When answering about financial statements, aging schedules, or breakdowns from tables, extract and report all pertinent numbers completely without skipping categories.
3. Cite the exact page number(s) where the evidence was found (e.g. Page {retrieved_chunks[0].get('page_number', 1) if retrieved_chunks else 1})."""
    return user_prompt


def build_rag_prompt(query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """Construct institutional financial analyst prompt enforcing strict citation grounding."""
    context_str = format_context_for_llm(retrieved_chunks)

    prompt = f"""You are DoxFin's Quantitative Financial Analysis Engine.
Answer the user's financial question STRICTLY using the retrieved context provided below.

RULES:
1. Ground every claim with exact citations in the format [Page X, Section Name].
2. If the answer is not supported by the retrieved context, state clearly: "{INSUFFICIENT_EVIDENCE_MESSAGE}".
3. Financial calculations and facts must be deterministic and verifiable from the evidence.
4. Do NOT speculate, extrapolate, or hallucinate outside the given text.

=== RETRIEVED FINANCIAL EVIDENCE ===
{context_str}
====================================

User Question: {query}

Financial Analysis & Evidence-Backed Answer:"""
    return prompt


class RAGService:
    """
    RAG Pipeline orchestrator & Evaluation Service (Phases 33 & 34).
    """

    @classmethod
    def query_document(
        cls,
        query: str,
        faiss_store: FaissStore,
        top_k: int = 8,
        llm_fn: Optional[Callable[[str], str]] = None,
        min_threshold: float = MIN_EVIDENCE_THRESHOLD,
        verified_metrics: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        # Security Guard: Adversarial prompt injection & jailbreak detection
        is_safe, safety_reason = check_prompt_safety(query)
        if not is_safe:
            return {
                "query": query,
                "answer": safety_reason,
                "has_sufficient_evidence": False,
                "refusal_reason": "PROMPT_INJECTION_DETECTED",
                "prompt": None,
                "citations": [],
                "retrieved_chunks_count": 0,
                "status": "SECURITY_VIOLATION"
            }

        chunks = retrieve_context(query, faiss_store, top_k=top_k)
        has_evidence, reason = is_evidence_sufficient(query, chunks, threshold=min_threshold)

        citations = [
            {
                "page_number": c["page_number"],
                "section": c["section"],
                "chunk_id": c.get("chunk_id"),
                "score": round(float(c.get("score", 0.0)), 4),
                "source_type": c.get("source_type", "table" if "|" in c.get("text", "") else "general_text"),
                "text": c.get("text", ""),
                "text_snippet": c.get("text", "")
            }
            for c in chunks
        ]

        # Phase 34: When evidence is insufficient, refuse gracefully without hallucinating
        if not has_evidence:
            return {
                "query": query,
                "answer": INSUFFICIENT_EVIDENCE_MESSAGE,
                "has_sufficient_evidence": False,
                "refusal_reason": reason,
                "prompt": None,
                "citations": [],
                "retrieved_chunks_count": 0,
                "status": "INSUFFICIENT_EVIDENCE"
            }

        prompt = build_rag_prompt(query, chunks)

        if llm_fn is not None:
            answer = llm_fn(prompt)
        else:
            try:
                from app.services.granite_service import get_granite_service
                from app.prompts.financial_qa import DOXFIN_SYSTEM_PROMPT

                granite = get_granite_service()
                granite_prompt = format_rag_prompt_for_granite(query, chunks, verified_metrics=verified_metrics)
                answer = granite.generate(system_prompt=DOXFIN_SYSTEM_PROMPT, user_prompt=granite_prompt)
            except Exception as exc:
                # Deterministic evidence synthesizer fallback if LLM is offline
                top_source = chunks[0] if chunks else {}
                citations_summary = ", ".join([f"Page {c['page_number']} ({c['section']})" for c in chunks[:3]])
                answer = (
                    f"Based on referenced disclosures from {citations_summary}: "
                    f"{top_source.get('text', '')[:200]}... "
                    f"(Page {top_source.get('page_number', 1)}, {top_source.get('section', 'General')})."
                )

        return {
            "query": query,
            "answer": answer,
            "has_sufficient_evidence": True,
            "refusal_reason": None,
            "prompt": prompt,
            "citations": citations,
            "retrieved_chunks_count": len(chunks),
            "status": "ANSWERED_WITH_EVIDENCE"
        }

    @classmethod
    def query_by_doc_id(
        cls,
        query: str,
        doc_id: str,
        vector_store_dir: str = "vector_store",
        top_k: int = 5,
        llm_fn: Optional[Callable[[str], str]] = None,
        min_threshold: float = MIN_EVIDENCE_THRESHOLD,
        verified_metrics: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Load index from vector_store and execute RAG query."""
        store = load_document_store(doc_id=doc_id, vector_store_dir=vector_store_dir)
        return cls.query_document(
            query=query,
            faiss_store=store,
            top_k=top_k,
            llm_fn=llm_fn,
            min_threshold=min_threshold,
            verified_metrics=verified_metrics
        )

    @classmethod
    def evaluate_rag_benchmark(
        cls,
        eval_questions: List[Dict[str, Any]],
        doc_id: str,
        vector_store_dir: str = "vector_store"
    ) -> Dict[str, Any]:
        """
        Phase 33 RAG Evaluation Suite (50-100 Questions):
        Evaluates 3 Core Dimensions:
        1. Answer Correctness (Fact & figure accuracy)
        2. Evidence Retrieved (Top chunks contain required facts)
        3. Page Reference Correctness (Exact source page cited)
        """
        store = load_document_store(doc_id=doc_id, vector_store_dir=vector_store_dir)

        results = []
        answer_correct_count = 0
        evidence_correct_count = 0
        page_correct_count = 0
        insufficient_correct_count = 0

        for item in eval_questions:
            q_text = item["question"]
            expected_answer_keywords = item.get("expected_keywords", [])
            expected_pages = item.get("expected_pages", [])
            should_be_insufficient = item.get("should_be_insufficient", False)

            rag_res = cls.query_document(query=q_text, faiss_store=store, top_k=4)
            actual_answer = rag_res["answer"]
            retrieved_pages = [c["page_number"] for c in rag_res.get("citations", [])]

            if should_be_insufficient:
                is_refused = (rag_res["status"] == "INSUFFICIENT_EVIDENCE") or (INSUFFICIENT_EVIDENCE_MESSAGE in actual_answer)
                ans_ok = is_refused
                ev_ok = is_refused
                page_ok = True
                if is_refused:
                    insufficient_correct_count += 1
            else:
                # 1. Answer fact check
                ans_ok = any(kw.lower() in actual_answer.lower() for kw in expected_answer_keywords) if expected_answer_keywords else True
                
                # 2. Evidence retrieval check
                chunk_texts = " ".join([c["text_snippet"].lower() for c in rag_res.get("citations", [])])
                ev_ok = any(kw.lower() in chunk_texts for kw in expected_answer_keywords) if expected_answer_keywords else True
                
                # 3. Page reference check
                page_ok = any(p in retrieved_pages for p in expected_pages) if expected_pages else True

            if ans_ok: answer_correct_count += 1
            if ev_ok: evidence_correct_count += 1
            if page_ok: page_correct_count += 1

            overall_pass = ans_ok and ev_ok and page_ok

            results.append({
                "question": q_text,
                "answer_correct": ans_ok,
                "evidence_correct": ev_ok,
                "page_reference_correct": page_ok,
                "overall_passed": overall_pass,
                "retrieved_pages": retrieved_pages,
                "expected_pages": expected_pages,
                "status": rag_res["status"]
            })

        total = len(eval_questions)
        return {
            "total_questions_evaluated": total,
            "answer_accuracy_pct": round(answer_correct_count / total * 100, 2) if total else 100.0,
            "evidence_retrieval_accuracy_pct": round(evidence_correct_count / total * 100, 2) if total else 100.0,
            "page_reference_accuracy_pct": round(page_correct_count / total * 100, 2) if total else 100.0,
            "overall_pass_rate_pct": round(sum(1 for r in results if r["overall_passed"]) / total * 100, 2) if total else 100.0,
            "evaluation_details": results
        }
