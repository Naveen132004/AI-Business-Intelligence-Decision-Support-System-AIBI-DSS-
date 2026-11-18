from typing import List
from urllib.parse import quote

from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database. Either set DATABASE_URL directly, or let it be built from the
    # backend's settings (DB_URL in JDBC form + DB_USER + DB_PASSWORD) so a
    # host can share one set of credentials between both services.
    DATABASE_URL: str = ""
    DB_URL: str = ""
    DB_USER: str = ""
    DB_PASSWORD: str = ""

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

    @model_validator(mode="after")
    def _resolve_database_url(self):
        if not self.DATABASE_URL:
            if self.DB_URL.startswith("jdbc:postgresql://"):
                # jdbc:postgresql://host[:port]/db?params -> postgresql://user:pass@host[:port]/db?params
                rest = self.DB_URL[len("jdbc:postgresql://"):]
                creds = ""
                if self.DB_USER:
                    creds = quote(self.DB_USER, safe="")
                    if self.DB_PASSWORD:
                        creds += ":" + quote(self.DB_PASSWORD, safe="")
                    creds += "@"
                self.DATABASE_URL = f"postgresql://{creds}{rest}"
            else:
                self.DATABASE_URL = "postgresql://aibi_user:aibi_secret_2024@localhost:5433/aibi_db"
        return self


settings = Settings()
