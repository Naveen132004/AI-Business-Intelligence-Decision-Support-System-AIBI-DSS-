from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://aibi_user:aibi_secret_2024@localhost:5433/aibi_db"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:8080"]

    # Gemini API
    GEMINI_API_KEY: str = ""

    # Embeddings: "local" runs sentence-transformers in-process (needs PyTorch,
    # ~1 GB RAM); "gemini" calls the Gemini embedding API instead, which keeps
    # the service small enough for 512 MB hosts. Both produce 384-dim vectors.
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    EMBEDDING_DIM: int = 384

    # Gemini model used to write assistant answers
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Shared secret the backend sends as X-Internal-Key. When set, /api/*
    # rejects requests without it (needed when this service has a public URL).
    INTERNAL_API_KEY: str = ""

    # RAG settings
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.3

    class Config:
        env_file = ".env"


settings = Settings()
