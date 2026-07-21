from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    PORT:    int = 8001
    HOST:    str = "0.0.0.0"
    WORKERS: int = 1

    AI_SERVICE_URL: str = "http://localhost:8001"

    # Face matching — 0.55 for cross-domain ID photo vs live selfie
    FACE_MATCH_THRESHOLD: float = Field(
        default=0.55,
        description="Cosine similarity threshold for ID photo vs live selfie."
    )

    # Liveness — EAR below this = eye closed = blink registered
    LIVENESS_EAR_THRESHOLD: float = Field(
        default=0.25,
        description="Eye aspect ratio threshold for blink detection."
    )

    # Minimum blinks required to pass liveness
    LIVENESS_MIN_BLINKS: int = Field(
        default=1,
        description="Minimum blink count to pass liveness challenge."
    )

    MODEL_CACHE_DIR: str = "./model_cache"
    JWT_SECRET:      str = "uail-dev-secret-change-in-production"

    class Config:
        env_file          = ".env"
        env_file_encoding = "utf-8"
        extra             = "ignore"


settings = Settings()