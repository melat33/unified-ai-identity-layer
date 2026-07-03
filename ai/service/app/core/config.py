from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration for the UAIL AI Service.

    Values are loaded from environment variables and/or a .env file.
    Every other module imports `settings` from here and never
    hardcodes a tunable value directly.
    """

    # ------------------------------------------------------------------
    # Server Settings
    # ------------------------------------------------------------------
    APP_NAME: str = "UAIL AI Service"
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # ------------------------------------------------------------------
    # AI Model Thresholds
    # ------------------------------------------------------------------
    FACE_MATCH_THRESHOLD: float = Field(
        default=0.85,
        description="Minimum cosine similarity required for a successful face match."
    )

    LIVENESS_EAR_THRESHOLD: float = Field(
        default=0.20,
        description="Eye Aspect Ratio threshold used for blink detection."
    )

    LIVENESS_BLINKS_REQUIRED: int = Field(
        default=2,
        description="Minimum number of valid blinks required."
    )

    LIVENESS_TIMEOUT_SECONDS: int = Field(
        default=12,
        description="Maximum duration of the liveness challenge."
    )

    DOC_QUALITY_MIN_BRIGHTNESS: int = Field(
        default=80,
        description="Minimum average brightness required for document capture."
    )

    # ------------------------------------------------------------------
    # Model Paths
    # ------------------------------------------------------------------
    MODEL_CACHE_DIR: str = "./model_cache"
    XGBOOST_MODEL_PATH: str = "./model_cache/fraud_model.json"

    # ------------------------------------------------------------------
    # MinIO Storage
    # ------------------------------------------------------------------
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "uail-temp-kyc"

    # ------------------------------------------------------------------
    # Pydantic Settings Configuration
    # ------------------------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Singleton settings instance — import this everywhere else
settings = Settings()