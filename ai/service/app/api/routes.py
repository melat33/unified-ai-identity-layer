import base64
import logging

from fastapi import APIRouter, HTTPException

from app.models.model_registry       import ModelRegistry
from app.pipelines.ekyc_pipeline     import run_ekyc
from app.processors.face_processor   import extract_embedding
from app.processors.liveness_processor import verify_liveness
from app.schemas.ekyc_schema import (
    EKYCRequest,
    EKYCResponse,
    OCRFields,
    ReauthRequest,
    ReauthResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────

def _decode_b64(field_name: str, b64_string: str) -> bytes:
    """
    Decode a base64 string to bytes.
    Strips the data URL prefix if present (e.g. 'data:image/jpeg;base64,...').
    Raises HTTPException 400 on invalid base64.
    """
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        return base64.b64decode(b64_string)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 encoding in field '{field_name}'."
        )


# ── GET /health ───────────────────────────────────────────────────────

@router.get("/health")
def health():
    """
    Returns service health and model load status.
    Used by Docker health checks and the API gateway.
    """
    return {
        "status":        "ok",
        "models_loaded": ModelRegistry()._loaded,
    }


# ── POST /verify/ekyc ────────────────────────────────────────────────

@router.post("/verify/ekyc", response_model=EKYCResponse)
def verify_ekyc(request: EKYCRequest):
    """
    Full eKYC verification pipeline.

    Accepts a document image and a live selfie (both base64),
    plus the EAR log from the browser liveness challenge.

    Returns kyc_passed = face_match AND liveness_passed.
    """
    logger.info(
        "eKYC request: session=%s challenge=%s ear_frames=%d",
        request.session_id,
        request.challenge_type,
        len(request.ear_log)
    )

    doc_bytes    = _decode_b64("doc_image", request.doc_image)
    selfie_bytes = _decode_b64("selfie",    request.selfie)

    try:
        pipeline_result = run_ekyc(
            doc_image_bytes=doc_bytes,
            selfie_bytes=selfie_bytes,
            ear_log=request.ear_log,
            challenge_type=request.challenge_type,
        )
    except ValueError as e:
        logger.warning("eKYC bad request: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("eKYC pipeline unexpected error.")
        raise HTTPException(status_code=500, detail="Internal verification error.")

    # Map raw OCR fields dict → OCRFields model
    raw_ocr = pipeline_result.get("ocr_fields") or {}
    ocr_fields_model = OCRFields(
        name=      raw_ocr.get("name"),
        dob=       raw_ocr.get("dob"),
        id_number= raw_ocr.get("id_number"),
        expiry=    raw_ocr.get("expiry"),
        address=   raw_ocr.get("address"),
    )

    logger.info(
        "eKYC complete: session=%s kyc_passed=%s similarity=%.4f",
        request.session_id,
        pipeline_result["kyc_passed"],
        pipeline_result["face_similarity"]
    )

    return EKYCResponse(
        session_id=      request.session_id,
        kyc_passed=      pipeline_result["kyc_passed"],
        face_similarity= pipeline_result["face_similarity"],
        face_match=      pipeline_result["face_match"],
        liveness_passed= pipeline_result["liveness_passed"],
        liveness_reason= pipeline_result["liveness_reason"],
        blink_count=     pipeline_result["blink_count"],
        det_score=       pipeline_result["det_score"],
        ocr_fields=      ocr_fields_model,
        error=           pipeline_result.get("error"),
    )


# ── POST /verify/reauth ───────────────────────────────────────────────

@router.post("/verify/reauth", response_model=ReauthResponse)
def verify_reauth(request: ReauthRequest):
    """
    Biometric re-authentication for returning users.

    Used before sensitive actions — payment authorization,
    account changes. Does not re-run OCR or document check.
    """
    logger.info(
        "Reauth request: session=%s challenge=%s",
        request.session_id,
        request.challenge_type
    )

    selfie_bytes = _decode_b64("selfie", request.selfie)

    try:
        # Face detection on selfie
        selfie_result = extract_embedding(selfie_bytes)

        # Liveness verification
        liveness = verify_liveness(
            ear_log=request.ear_log,
            challenge_type=request.challenge_type,
            selfie_bytes=selfie_bytes
        )

    except ValueError as e:
        logger.warning("Reauth bad request: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Reauth unexpected error.")
        raise HTTPException(status_code=500, detail="Internal re-authentication error.")

    passed = liveness["passed"]

    logger.info(
        "Reauth complete: session=%s passed=%s det_score=%.3f",
        request.session_id,
        passed,
        selfie_result.det_score
    )

    return ReauthResponse(
        passed=     passed,
        similarity= selfie_result.det_score,
        det_score=  selfie_result.det_score,
        reason=     liveness["reason"]
    )