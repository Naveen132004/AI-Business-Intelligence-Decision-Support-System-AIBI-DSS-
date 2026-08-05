from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.health_score import service as health_service

router = APIRouter()


@router.post("/calculate")
async def calculate_health_score(db: Session = Depends(get_db)):
    """Calculate a new business health score."""
    try:
        score_id = health_service.calculate_health_score(db)
        return {"message": "Health score calculated successfully", "score_id": score_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health score calculation failed: {str(e)}")


@router.get("/latest")
async def get_latest_health_score(db: Session = Depends(get_db)):
    """Get the most recent health score."""
    result = health_service.get_latest_health_score(db)
    if not result:
        raise HTTPException(status_code=404, detail="No health score available. Calculate one first.")
    return result
