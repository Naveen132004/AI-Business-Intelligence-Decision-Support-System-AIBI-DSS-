from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date


class ForecastDataPoint(BaseModel):
    month: str
    actual: Optional[float] = None
    predicted: float
    lower: float
    upper: float


class ModelMetrics(BaseModel):
    mae: float
    mape: float
    data_points: int
    forecast_months: int


class ComponentImportance(BaseModel):
    name: str
    importance: float
    description: str


class ShapSummary(BaseModel):
    components: List[ComponentImportance]


class ForecastResponse(BaseModel):
    id: int
    forecast_type: str
    generated_at: datetime
    period_start: date
    period_end: date
    forecast_data: List[ForecastDataPoint]
    model_metrics: ModelMetrics
    shap_summary: ShapSummary

    class Config:
        from_attributes = True


class ForecastTrainResponse(BaseModel):
    message: str
    forecast_id: int
