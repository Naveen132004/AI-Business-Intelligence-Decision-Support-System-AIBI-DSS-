from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.forecasting import service as forecast_service

router = APIRouter()


@router.post("/train")
def train_forecast(db: Session = Depends(get_db)):
    """Train a new Prophet forecast model on historical order data."""
    try:
        forecast_id = forecast_service.train_forecast(db)
        return {"message": "Forecast trained successfully", "forecast_id": forecast_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast training failed: {str(e)}")


@router.get("/latest")
def get_latest_forecast(db: Session = Depends(get_db)):
    """Get the most recent revenue forecast."""
    result = forecast_service.get_latest_forecast(db)
    if not result:
        raise HTTPException(status_code=404, detail="No forecast available. Train a model first.")
    return result
