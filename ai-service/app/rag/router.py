"""FastAPI router for the RAG Business Assistant."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.rag import service as rag_service
from app.rag.schemas import AskRequest

router = APIRouter()


@router.post("/ask")
async def ask_assistant(request: AskRequest, db: Session = Depends(get_db)):
    """Ask a natural-language question about business data."""
    try:
        result = rag_service.ask(db, request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant query failed: {str(e)}")


@router.post("/sync")
async def sync_data(db: Session = Depends(get_db)):
    """Sync (re-index) all business data into the vector store."""
    try:
        result = rag_service.sync_business_data(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data sync failed: {str(e)}")


@router.get("/status")
async def get_status(db: Session = Depends(get_db)):
    """Get the current status of the RAG vector index."""
    try:
        return rag_service.get_status(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
