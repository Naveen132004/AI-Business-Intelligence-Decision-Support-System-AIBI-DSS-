from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="AIBI-DSS AI Service",
    description="AI microservice for Sales Forecasting, Business Health Score, and RAG Assistant",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "aibi-ai-service",
    }


# ── Route registration (will be added module by module) ──
# from app.forecasting.router import router as forecast_router
# from app.rag.router import router as rag_router
# from app.health_score.router import router as health_score_router
# app.include_router(forecast_router, prefix="/api/forecast", tags=["Forecasting"])
# app.include_router(rag_router, prefix="/api/assistant", tags=["RAG Assistant"])
# app.include_router(health_score_router, prefix="/api/health-score", tags=["Health Score"])
