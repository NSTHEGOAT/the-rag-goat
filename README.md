"""Central config. Everything is overridable via environment variables."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Storage
DATA_DIR = Path(os.getenv("RAG_DATA_DIR", BASE_DIR / "data"))
CHROMA_DIR = Path(os.getenv("RAG_CHROMA_DIR", BASE_DIR / "chroma_db"))
COLLECTION_NAME = os.getenv("RAG_COLLECTION", "documents")

# Embeddings (runs locally via sentence-transformers, downloads once then cached)
EMBED_MODEL = os.getenv("RAG_EMBED_MODEL", "all-MiniLM-L6-v2")

# Chunking
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "900"))      # characters
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))

# Retrieval
DEFAULT_TOP_K = int(os.getenv("RAG_TOP_K", "5"))

# Ollama
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
# NOTE: "Falcon 5" does not exist on Ollama. Use `falcon3` (ollama pull falcon3)
# or any other model you have pulled locally, e.g. llama3.2, qwen2.5, mistral.
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "falcon3")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "180"))

DATA_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)
