from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://aibi_user:aibi_secret_2024@localhost:5433/aibi_db"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:8080"]

    # Gemini API
    GEMINI_API_KEY: str = ""

    # Embedding model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # RAG settings
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.3

    class Config:
        env_file = ".env"


settings = Settings()
