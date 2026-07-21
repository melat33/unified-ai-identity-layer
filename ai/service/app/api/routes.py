import base64
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.model_registry         import ModelRegistry
from app.pipelines.ekyc_pipeline       import run_ekyc
from app.processors.face_processor     import extract_embedding
from app.processors.liveness_processor import verify_liveness
from app.schemas.ekyc_schema import (
    EKYCRequest, EKYCResponse, OCRFields,
    ReauthRequest, ReauthResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class OCROnlyRequest(BaseModel):
    doc_image: str


def _decode_b64(field_name: str, b64_string: str) -> bytes:
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        return base64.b64decode(b64_string)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 in field '{field_name}'."
        )


# ── GET /health ───────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {
        "status":        "ok",
        "models_loaded": ModelRegistry()._loaded,
    }


# ── POST /ocr ─────────────────────────────────────────────────────────

@router.post("/ocr")
def run_ocr_only(request: OCROnlyRequest):
    """
    Fast OCR-only endpoint — skips InsightFace face detection.
    InsightFace adds 15-30s. Skipping it cuts OCR time to 10-15s.
    Full pipeline (including face detection) runs at /verify/ekyc.
    """
    logger.info("OCR request: b64_chars=%d", len(request.doc_image))

    try:
        doc_bytes = _decode_b64("doc_image", request.doc_image)
        logger.info("Decoded: %d bytes", len(doc_bytes))

        import cv2
        import numpy as np

        image = cv2.imdecode(np.frombuffer(doc_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            return {
                "ocr_fields":     {},
                "fields_found":   0,
                "error":          "Could not decode image — upload a valid JPG or PNG.",
                "quality_failed": True
            }

        h, w = image.shape[:2]
        logger.info("Image: %dx%d", w, h)

        from app.processors.image_processor import correct_document
        corrected = correct_document(doc_bytes)
        logger.info("Corrected: %d bytes", len(corrected))

        from app.processors.ocr_processor import extract_id_fields
        logger.info("Running PaddleOCR…")
        fields = extract_id_fields(corrected)

        found = {
            k: v for k, v in fields.items()
            if k not in ("raw_texts", "confidence_scores") and v
        }

        logger.info(
            "OCR complete: %d fields — %s",
            len(found),
            {k: str(v)[:40] for k, v in found.items()}
        )

        return {
            "ocr_fields":     fields,
            "fields_found":   len(found),
            "error":          None,
            "quality_failed": False
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("OCR error")
        return {
            "ocr_fields":     {},
            "fields_found":   0,
            "error":          f"OCR error: {str(e)}",
            "quality_failed": False
        }


# ── POST /verify/ekyc ────────────────────────────────────────────────

@router.post("/verify/ekyc", response_model=EKYCResponse)
def verify_ekyc(request: EKYCRequest):
    """
    Full eKYC pipeline: preprocess + OCR + InsightFace + liveness.
    Accepts cached_ocr to skip re-running OCR if already done.
    """
    logger.info(
        "eKYC: session=%s  ear_frames=%d  has_cached_ocr=%s",
        request.session_id,
        len(request.ear_log),
        bool(request.cached_ocr)
    )

    doc_bytes    = _decode_b64("doc_image", request.doc_image)
    selfie_bytes = _decode_b64("selfie",    request.selfie)

    try:
        result = run_ekyc(
            doc_image_bytes=doc_bytes,
            selfie_bytes=selfie_bytes,
            ear_log=request.ear_log,
            challenge_type=request.challenge_type,
            cached_ocr=request.cached_ocr,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("eKYC pipeline error")
        raise HTTPException(status_code=500, detail="Internal verification error.")

    raw_ocr   = result.get("ocr_fields") or {}
    ocr_model = OCRFields(
        name=      raw_ocr.get("name"),
        dob=       raw_ocr.get("dob"),
        id_number= raw_ocr.get("id_number"),
        expiry=    raw_ocr.get("expiry"),
        address=   raw_ocr.get("address"),
    )

    logger.info(
        "eKYC done: session=%s  passed=%s  similarity=%.4f",
        request.session_id,
        result["kyc_passed"],
        result["face_similarity"]
    )

    return EKYCResponse(
        session_id=      request.session_id,
        kyc_passed=      result["kyc_passed"],
        face_similarity= result["face_similarity"],
        face_match=      result["face_match"],
        liveness_passed= result["liveness_passed"],
        liveness_reason= result["liveness_reason"],
        blink_count=     result["blink_count"],
        det_score=       result["det_score"],
        ocr_fields=      ocr_model,
        error=           result.get("error"),
    )


# ── POST /verify/reauth ───────────────────────────────────────────────

@router.post("/verify/reauth", response_model=ReauthResponse)
def verify_reauth(request: ReauthRequest):
    """Biometric re-authentication — selfie + liveness only."""
    selfie_bytes = _decode_b64("selfie", request.selfie)
    try:
        selfie_result = extract_embedding(selfie_bytes)
        liveness      = verify_liveness(
            ear_log=request.ear_log,
            challenge_type=request.challenge_type,
            selfie_bytes=selfie_bytes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Reauth error")
        raise HTTPException(status_code=500, detail="Re-authentication error.")

    return ReauthResponse(
        passed=     liveness["passed"],
        similarity= selfie_result.det_score,
        det_score=  selfie_result.det_score,
        reason=     liveness["reason"]
    )