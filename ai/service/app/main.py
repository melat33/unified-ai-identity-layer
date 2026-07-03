from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.models.model_registry import ModelRegistry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load AI models once when the application starts.
    """
    ModelRegistry().load_all()
    yield


app = FastAPI(
    title="UAIL AI Service",
    description="AI-powered eKYC, OCR, Face Verification, and Liveness Detection Service.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------
# CORS (Allow all origins for the hackathon sprint)
# ---------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------
app.include_router(router, prefix="/api/v1", tags=["AI Service"])

# ---------------------------------------------------------------------
# Health / Root Endpoint
# ---------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "UAIL AI Service",
        "version": "1.0.0",
    }