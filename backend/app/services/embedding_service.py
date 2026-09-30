"""Embedding Service for document chunk vectorization"""
from typing import List


class EmbeddingService:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate dense vector embeddings for texts.
        """
        return []
