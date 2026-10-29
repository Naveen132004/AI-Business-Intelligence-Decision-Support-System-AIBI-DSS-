import hmac

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.middleware("http")
async def require_internal_key(request: Request, call_next):
    """Only the backend may call /api/* when INTERNAL_API_KEY is set."""
    if settings.INTERNAL_API_KEY and request.url.path.startswith("/api/"):
        sent = request.headers.get("x-internal-key", "")
        if not hmac.compare_digest(sent, settings.INTERNAL_API_KEY):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid internal key"})
    return await call_next(request)


@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "aibi-ai-service",
    }


# ── Route registration ──
from app.forecasting.router import router as forecast_router
app.include_router(forecast_router, prefix="/api/forecast", tags=["Forecasting"])

from app.health_score.router import router as health_score_router
app.include_router(health_score_router, prefix="/api/health-score", tags=["Health Score"])

from app.rag.router import router as rag_router
app.include_router(rag_router, prefix="/api/assistant", tags=["RAG Assistant"])
