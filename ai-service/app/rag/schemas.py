"""Pydantic schemas for the RAG Business Assistant."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000, description="Natural-language business question")


class SourceChunk(BaseModel):
    source_type: str
    source_id: Optional[str] = None
    content: str
    score: float


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    chunks_in_db: int


class SyncResponse(BaseModel):
    message: str
    chunks_created: int
    chunks_deleted: int


class StatusResponse(BaseModel):
    chunks_in_db: int
    last_synced: Optional[datetime] = None
    source_breakdown: dict = {}
