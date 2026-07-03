from __future__ import annotations

import logging

from app.processors.image_processor    import preprocess
from app.processors.ocr_processor      import extract_id_fields
from app.processors.face_processor     import extract_embedding, compare_embeddings
from app.processors.liveness_processor import verify_liveness

logger = logging.getLogger(__name__)


def run_ekyc(
    doc_image_bytes: bytes,
    selfie_bytes:    bytes,
    ear_log:         list[float],
    challenge_type:  str,
) -> dict:
    """
    End-to-end eKYC pipeline.

    Flow:
        1. Document quality assessment and preprocessing
        2. OCR field extraction
        3. Document face embedding (from ID photo)
        4. Selfie face embedding (from live capture)
        5. Face comparison — cosine similarity vs threshold
        6. Liveness verification — EAR log + selfie face detection
        7. Final decision — kyc_passed = face_match AND liveness_passed

    Each step is independently guarded. A failure sets result["error"]
    and returns early so the caller always receives a well-formed dict.

    Returns:
        {
            kyc_passed:      bool,
            face_similarity: float,
            face_match:      bool,
            liveness_passed: bool,
            liveness_reason: str,
            blink_count:     int,
            det_score:       float,
            ocr_fields:      dict,
            error:           str | None
        }
    """
    result = {
        "kyc_passed":      False,
        "face_similarity": 0.0,
        "face_match":      False,
        "liveness_passed": False,
        "liveness_reason": "",
        "blink_count":     0,
        "det_score":       0.0,
        "ocr_fields":      {},
        "error":           None,
    }

    # ── Step 1: Image preprocessing ───────────────────────────────────
    try:
        corrected_doc_bytes = preprocess(doc_image_bytes)
        logger.info("Step 1 complete: document preprocessed.")
    except Exception as e:
        logger.error("Step 1 failed: %s", e)
        result["error"] = f"Image preprocessing failed: {e}"
        return result

    # ── Step 2: OCR field extraction ──────────────────────────────────
    try:
        ocr_fields = extract_id_fields(corrected_doc_bytes)
        result["ocr_fields"] = ocr_fields
        logger.info("Step 2 complete: OCR extracted %d fields.",
                    sum(1 for v in ocr_fields.values() if v and isinstance(v, str)))
    except Exception as e:
        logger.error("Step 2 failed: %s", e)
        result["error"] = f"OCR extraction failed: {e}"
        return result

    # ── Step 3: Document face embedding ───────────────────────────────
    try:
        doc_result = extract_embedding(corrected_doc_bytes)
        logger.info("Step 3 complete: doc face det_score=%.3f.", doc_result.det_score)
    except Exception as e:
        logger.error("Step 3 failed: %s", e)
        result["error"] = f"Document face extraction failed: {e}"
        return result

    # ── Step 4: Selfie face embedding ─────────────────────────────────
    try:
        selfie_result = extract_embedding(selfie_bytes)
        logger.info("Step 4 complete: selfie face det_score=%.3f.", selfie_result.det_score)
    except Exception as e:
        logger.error("Step 4 failed: %s", e)
        result["error"] = f"Selfie face extraction failed: {e}"
        return result

    # ── Step 5: Face comparison ───────────────────────────────────────
    try:
        face_cmp = compare_embeddings(
            doc_result.embedding,
            selfie_result.embedding
        )
        result["face_similarity"] = face_cmp["similarity"]
        result["face_match"]      = face_cmp["match"]
        logger.info(
            "Step 5 complete: similarity=%.4f match=%s threshold=%.2f.",
            face_cmp["similarity"],
            face_cmp["match"],
            face_cmp["threshold"]
        )
    except Exception as e:
        logger.error("Step 5 failed: %s", e)
        result["error"] = f"Face comparison failed: {e}"
        return result

    # ── Step 6: Liveness verification ─────────────────────────────────
    try:
        liveness = verify_liveness(
            ear_log=ear_log,
            challenge_type=challenge_type,
            selfie_bytes=selfie_bytes
        )
        result["liveness_passed"] = liveness["passed"]
        result["liveness_reason"] = liveness["reason"]
        result["blink_count"]     = liveness["blink_count"]
        result["det_score"]       = liveness["det_score"]
        logger.info(
            "Step 6 complete: liveness=%s blinks=%d det_score=%.3f.",
            liveness["passed"],
            liveness["blink_count"],
            liveness["det_score"]
        )
    except Exception as e:
        logger.error("Step 6 failed: %s", e)
        result["error"] = f"Liveness verification failed: {e}"
        return result

    # ── Step 7: Final decision ────────────────────────────────────────
    result["kyc_passed"] = result["face_match"] and result["liveness_passed"]

    logger.info(
        "eKYC pipeline complete: kyc_passed=%s face_match=%s liveness=%s.",
        result["kyc_passed"],
        result["face_match"],
        result["liveness_passed"]
    )

    return result