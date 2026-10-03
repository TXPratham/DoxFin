import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
import numpy as np

try:
    import faiss
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False
    faiss = None


class FaissStore:

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.metadata: List[Dict[str, Any]] = []
        self._vectors: Optional[np.ndarray] = None

        if HAS_FAISS:
            self.index = faiss.IndexFlatIP(dimension)
        else:
            self.index = None

    def add(self, embeddings: Union[np.ndarray, List[List[float]]], metadata: List[Dict[str, Any]]) -> None:
        vectors = np.asarray(embeddings, dtype="float32")
        if HAS_FAISS and self.index is not None:
            self.index.add(vectors)
        
        if self._vectors is None:
            self._vectors = vectors
        else:
            self._vectors = np.vstack([self._vectors, vectors])

        self.metadata.extend(metadata)

    def search(self, query_embedding: Union[np.ndarray, List[float]], k: int = 5) -> List[Dict[str, Any]]:
        query = np.asarray([query_embedding], dtype="float32")

        if HAS_FAISS and self.index is not None:
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

        # High-performance NumPy Vector Search fallback (exact cosine similarity / dot product)
        if self._vectors is None or len(self._vectors) == 0:
            return []

        q_vec = query[0]
        # Inner product on normalized vectors
        scores = np.dot(self._vectors, q_vec)
        top_k_indices = np.argsort(scores)[::-1][:k]

        results = []
        for idx in top_k_indices:
            if idx < len(self.metadata):
                results.append({
                    "score": float(scores[idx]),
                    "metadata": self.metadata[idx]
                })
        return results

    def save(self, index_path: Union[str, Path], metadata_path: Optional[Union[str, Path]] = None) -> None:
        """
        Save FAISS index and metadata to disk.
        """
        index_path = Path(index_path)
        index_path.parent.mkdir(parents=True, exist_ok=True)

        if metadata_path is None:
            metadata_path = index_path.parent / f"{index_path.stem}_metadata.json"
        else:
            metadata_path = Path(metadata_path)
            metadata_path.parent.mkdir(parents=True, exist_ok=True)

        if HAS_FAISS and self.index is not None:
            faiss.write_index(self.index, str(index_path))
        elif self._vectors is not None:
            np.save(str(index_path), self._vectors)
            npy_file = Path(str(index_path) + ".npy")
            if not index_path.exists() and npy_file.exists():
                import shutil
                shutil.copyfile(str(npy_file), str(index_path))
        else:
            with open(index_path, "wb") as f:
                f.write(b"")

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

    @classmethod
    def load(cls, index_path: Union[str, Path], metadata_path: Optional[Union[str, Path]] = None) -> "FaissStore":
        """
        Load FAISS index and metadata from disk.
        """
        index_path = Path(index_path)
        if not index_path.exists():
            if Path(str(index_path) + ".npy").exists():
                index_path = Path(str(index_path) + ".npy")
            elif index_path.with_suffix(".index.npy").exists():
                index_path = index_path.with_suffix(".index.npy")
            else:
                raise FileNotFoundError(f"FAISS index file not found: {index_path}")

        if metadata_path is None:
            metadata_path = index_path.parent / f"{index_path.stem.replace('.index', '')}_metadata.json"
        else:
            metadata_path = Path(metadata_path)

        if not metadata_path.exists():
            # Try alternate naming
            alt_meta = index_path.parent / f"{index_path.name.split('.')[0]}_metadata.json"
            if alt_meta.exists():
                metadata_path = alt_meta
            else:
                raise FileNotFoundError(f"Metadata file not found: {metadata_path}")

        store = None
        if HAS_FAISS:
            try:
                index = faiss.read_index(str(index_path))
                dimension = index.d
                store = cls(dimension=dimension)
                store.index = index
            except Exception:
                pass

        if store is None:
            try:
                vectors = np.load(str(index_path))
                dimension = vectors.shape[1] if hasattr(vectors, "shape") and len(vectors.shape) > 1 else 384
                store = cls(dimension=dimension)
                store._vectors = vectors
            except Exception:
                store = cls(dimension=384)

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