import logging

from insightface.app import FaceAnalysis
from paddleocr import PaddleOCR

from app.core.config import settings

logger = logging.getLogger(__name__)


class ModelRegistry:
    """
    Singleton registry responsible for loading and serving AI models.

    Models are loaded once during application startup and shared across
    all requests to avoid expensive reinitialization. Call load_all()
    exactly once, typically from a FastAPI startup event handler.
    """

    _instance = None
    _models = {}
    _loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
        return cls._instance

    def load_all(self):
        """
        Load every AI model required by the service.

        This method is intended to be called once during FastAPI startup.
        Individual model failures are logged without preventing the
        remaining models from loading, so a missing fraud model does not
        prevent eKYC from working.
        """
        if self._loaded:
            logger.info("Model registry already initialized.")
            return

        logger.info("Loading AI models...")

        # -------------------------------------------------------------
        # InsightFace — ArcFace R100 face detection + embedding
        # -------------------------------------------------------------
        try:
            logger.info("Loading InsightFace...")

            face = FaceAnalysis(
                name="buffalo_l",
                root=settings.MODEL_CACHE_DIR
            )

            face.prepare(ctx_id=-1)  # ctx_id=-1 forces CPU inference

            self._models["face"] = face

            logger.info("InsightFace loaded successfully.")

        except Exception:
            logger.exception("Failed to load InsightFace model.")

        # -------------------------------------------------------------
        # PaddleOCR — document field extraction
        # -------------------------------------------------------------
        try:
            logger.info("Loading PaddleOCR...")

            ocr = PaddleOCR(
                lang="en",
                use_angle_cls=True,
                show_log=False
            )

            self._models["ocr"] = ocr

            logger.info("PaddleOCR loaded successfully.")

        except Exception:
            logger.exception("Failed to load PaddleOCR model.")

        self._loaded = True

        logger.info("Model registry initialization complete.")

    def _ensure_loaded(self):
        if not self._loaded:
            raise RuntimeError(
                "Models have not been loaded. "
                "Call ModelRegistry().load_all() during FastAPI startup."
            )

    def get_face(self):
        """
        Returns the shared InsightFace model.

        Raises RuntimeError if the registry hasn't been initialized,
        or if InsightFace specifically failed to load at startup.
        """
        self._ensure_loaded()
        model = self._models.get("face")
        if model is None:
            raise RuntimeError(
                "InsightFace model is not available. "
                "Check startup logs for the load error."
            )
        return model

    def get_ocr(self):
        """
        Returns the shared PaddleOCR model.

        Raises RuntimeError if the registry hasn't been initialized,
        or if PaddleOCR specifically failed to load at startup.
        """
        self._ensure_loaded()
        model = self._models.get("ocr")
        if model is None:
            raise RuntimeError(
                "PaddleOCR model is not available. "
                "Check startup logs for the load error."
            )
        return model