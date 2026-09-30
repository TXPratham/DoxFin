"""FAISS Service for CPU-based vector search index management"""
import faiss
import numpy as np
from typing import List, Tuple, Any, Dict


class FAISSService:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.doc_map: Dict[int, Dict[str, Any]] = {}

    def add_vectors(self, embeddings: np.ndarray, metadatas: List[Dict[str, Any]]) -> None:
        """Add embedding vectors and track metadata mappings."""
        start_idx = self.index.ntotal
        self.index.add(embeddings)
        for i, meta in enumerate(metadatas):
            self.doc_map[start_idx + i] = meta

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """Search top-k nearest neighbors."""
        distances, indices = self.index.search(query_vector, top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx in self.doc_map:
                results.append((self.doc_map[idx], float(dist)))
        return results
