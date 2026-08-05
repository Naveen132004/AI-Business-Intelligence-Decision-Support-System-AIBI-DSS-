from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ComponentScore(BaseModel):
    name: str
    score: float
    weight: float
    explanation: str


class Recommendation(BaseModel):
    category: str
    priority: str  # HIGH, MEDIUM, LOW
    title: str
    description: str


class HealthScoreResponse(BaseModel):
    id: int
    overall_score: float
    component_scores: List[ComponentScore]
    explanations: List[str]
    recommendations: List[Recommendation]
    generated_at: datetime
    empty: Optional[bool] = None
    message: Optional[str] = None
