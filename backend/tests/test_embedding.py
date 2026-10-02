import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.embedding_service import create_embeddings

sample_texts = [
    "Revenue from operations increased by 15% YoY.",
    "Consolidated Net Profit for FY2025 stands at 16,420 crore INR."
]

print("Generating embeddings for sample texts...")
embeddings = create_embeddings(sample_texts)

print(f"Generated {len(embeddings)} embeddings.")
print(f"Embedding vector dimension: {embeddings.shape[1] if hasattr(embeddings, 'shape') else len(embeddings[0])}")
print("First embedding (sample vector slice):", embeddings[0][:5])
