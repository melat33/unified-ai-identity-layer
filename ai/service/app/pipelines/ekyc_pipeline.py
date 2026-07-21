from __future__ import annotations

import logging
from typing import Optional

from app.processors.image_processor    import preprocess
from app.processors.ocr_processor      import extract_id_fields
from app.processors.face_processor     import extract_embedding, compare_embeddings
from app.processors.liveness_processor import verify_liveness

logger = logging.getLogger(__name__)


def run_ekyc(
    doc_image_bytes: bytes,
    selfie_bytes:    bytes,
    ear_log:         list,
    challenge_type:  str,
    cached_ocr:      Optional[dict] = None,
) -> dict:
    """
    7-step eKYC pipeline.

    cached_ocr: if OCR was already run at document capture time,
    pass those fields here to skip re-running OCR (saves 15-30 seconds).
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

    # ── Step 1: Preprocess document ───────────────────────────────────
    try:
        corrected_doc = preprocess(doc_image_bytes)
        logger.info("Step 1 ✓ document preprocessed (%d bytes)", len(corrected_doc))
    except Exception as e:
        logger.error("Step 1 ✗ preprocessing failed: %s", e)
        result["error"] = f"Image preprocessing failed: {e}"
        return result

    # ── Step 2: OCR — skip if cached fields available ─────────────────
    cached_has_data = (
        cached_ocr and
        isinstance(cached_ocr, dict) and
        any(v for v in cached_ocr.values() if v)
    )

    if cached_has_data:
        result["ocr_fields"] = cached_ocr
        logger.info(
            "Step 2 ✓ using cached OCR — skipping re-extraction  name=%s",
            cached_ocr.get("name")
        )
    else:
        try:
            ocr_fields = extract_id_fields(corrected_doc)
            result["ocr_fields"] = ocr_fields
            logger.info(
                "Step 2 ✓ OCR extraction complete  name=%s  id=%s",
                ocr_fields.get("name"),
                ocr_fields.get("id_number")
            )
        except Exception as e:
            logger.error("Step 2 ✗ OCR failed: %s", e)
            result["error"] = f"OCR extraction failed: {e}"
            return result

    # ── Step 3: Document face embedding ───────────────────────────────
    # is_document=True → selects LARGEST face (main ID photo, not thumbnail)
    try:
        doc_face = extract_embedding(corrected_doc, is_document=True)
        logger.info(
            "Step 3 ✓ document face  det_score=%.3f  faces=%d",
            doc_face.det_score, doc_face.face_count
        )
    except Exception as e:
        logger.error("Step 3 ✗ document face extraction failed: %s", e)
        result["error"] = f"Document face extraction failed: {e}"
        return result

    # ── Step 4: Selfie face embedding ─────────────────────────────────
    # is_document=False → selects highest-confidence face
    try:
        selfie_face = extract_embedding(selfie_bytes, is_document=False)
        logger.info(
            "Step 4 ✓ selfie face  det_score=%.3f",
            selfie_face.det_score
        )
    except Exception as e:
        logger.error("Step 4 ✗ selfie face extraction failed: %s", e)
        result["error"] = f"Selfie face extraction failed: {e}"
        return result

    # ── Step 5: Face comparison ───────────────────────────────────────
    try:
        comparison = compare_embeddings(doc_face.embedding, selfie_face.embedding)
        result["face_similarity"] = comparison["similarity"]
        result["face_match"]      = comparison["match"]
        logger.info(
            "Step 5 ✓ similarity=%.4f  threshold=%.2f  match=%s",
            comparison["similarity"],
            comparison["threshold"],
            comparison["match"]
        )
    except Exception as e:
        logger.error("Step 5 ✗ face comparison failed: %s", e)
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
            "Step 6 ✓ liveness=%s  blinks=%d  reason=%s",
            liveness["passed"],
            liveness["blink_count"],
            liveness["reason"]
        )
    except Exception as e:
        logger.error("Step 6 ✗ liveness failed: %s", e)
        result["error"] = f"Liveness verification failed: {e}"
        return result

    # ── Step 7: Final decision ────────────────────────────────────────
    result["kyc_passed"] = result["face_match"] and result["liveness_passed"]

    logger.info(
        "Pipeline complete ✓  kyc_passed=%s  similarity=%.4f  liveness=%s",
        result["kyc_passed"],
        result["face_similarity"],
        result["liveness_passed"]
    )

    return result