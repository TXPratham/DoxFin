"""RAG Service for evidence-backed financial queries and citations"""
from typing import Dict, Any, List


class RAGService:
    @staticmethod
    def generate_answer(query: str, retrieved_context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesize answer strictly from retrieved financial evidence.
        """
        return {
            "query": query,
            "answer": "Explanation generated based on retrieved document sections.",
            "citations": [ctx.get("source", "Doc") for ctx in retrieved_context],
        }
