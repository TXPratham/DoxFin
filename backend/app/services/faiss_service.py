import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
import faiss
import numpy as np


class FaissStore:

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata: List[Dict[str, Any]] = []

    def add(self, embeddings: Union[np.ndarray, List[List[float]]], metadata: List[Dict[str, Any]]) -> None:
        vectors = np.asarray(embeddings, dtype="float32")
        self.index.add(vectors)
        self.metadata.extend(metadata)

    def search(self, query_embedding: Union[np.ndarray, List[float]], k: int = 5) -> List[Dict[str, Any]]:
        query = np.asarray([query_embedding], dtype="float32")
        scores, indices = self.index.search(query, k)

        results = []
        for score, index in zip(scores[0], indices[0]):
            if index == -1 or index >= len(self.metadata):
                continue
            results.append({
                "score": float(score),
                "metadata": self.metadata[index]
            })

        return results

    def save(self, index_path: Union[str, Path], metadata_path: Optional[Union[str, Path]] = None) -> None:
        """
        Save FAISS index and metadata to disk.
        If metadata_path is not specified, it will default to <index_path_stem>_metadata.json.
        """
        index_path = Path(index_path)
        index_path.parent.mkdir(parents=True, exist_ok=True)

        if metadata_path is None:
            metadata_path = index_path.parent / f"{index_path.stem}_metadata.json"
        else:
            metadata_path = Path(metadata_path)
            metadata_path.parent.mkdir(parents=True, exist_ok=True)

        faiss.write_index(self.index, str(index_path))

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

    @classmethod
    def load(cls, index_path: Union[str, Path], metadata_path: Optional[Union[str, Path]] = None) -> "FaissStore":
        """
        Load FAISS index and metadata from disk.
        """
        index_path = Path(index_path)
        if not index_path.exists():
            raise FileNotFoundError(f"FAISS index file not found: {index_path}")

        if metadata_path is None:
            metadata_path = index_path.parent / f"{index_path.stem}_metadata.json"
        else:
            metadata_path = Path(metadata_path)

        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")

        index = faiss.read_index(str(index_path))
        dimension = index.d

        store = cls(dimension=dimension)
        store.index = index

        with open(metadata_path, "r", encoding="utf-8") as f:
            store.metadata = json.load(f)

        return store


def save_document_store(store: FaissStore, doc_id: str, vector_store_dir: Union[str, Path] = "vector_store") -> Dict[str, str]:
    """
    Helper function to save index and metadata under vector_store/doc_{doc_id}.index and doc_{doc_id}_metadata.json
    """
    base_dir = Path(vector_store_dir)
    base_dir.mkdir(parents=True, exist_ok=True)

    index_path = base_dir / f"{doc_id}.index"
    metadata_path = base_dir / f"{doc_id}_metadata.json"

    store.save(index_path=index_path, metadata_path=metadata_path)
    return {
        "index_path": str(index_path),
        "metadata_path": str(metadata_path)
    }


def load_document_store(doc_id: str, vector_store_dir: Union[str, Path] = "vector_store") -> FaissStore:
    """
    Helper function to load index and metadata for a given document ID.
    """
    base_dir = Path(vector_store_dir)
    index_path = base_dir / f"{doc_id}.index"
    metadata_path = base_dir / f"{doc_id}_metadata.json"

    return FaissStore.load(index_path=index_path, metadata_path=metadata_path)