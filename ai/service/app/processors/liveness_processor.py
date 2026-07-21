from __future__ import annotations

import logging
from typing import List

import cv2
import numpy as np

logger = logging.getLogger(__name__)

# Safe import of settings with fallback defaults
try:
    from app.core.config import settings
    EAR_THRESHOLD = getattr(settings, "LIVENESS_EAR_THRESHOLD", 0.25)
    MIN_BLINKS    = getattr(settings, "LIVENESS_MIN_BLINKS",    1)
except Exception:
    EAR_THRESHOLD = 0.25
    MIN_BLINKS    = 1


def verify_blink_challenge(ear_log: List[float]) -> dict:
    """
    Count blinks from a sequence of EAR values.
    A blink = EAR drops below threshold then rises above it again.
    """
    if not ear_log:
        return {
            "passed":      False,
            "blink_count": 0,
            "reason":      "No EAR data received — liveness data missing.",
            "min_blinks":  MIN_BLINKS
        }

    blink_count = 0
    below       = False

    for ear in ear_log:
        if ear < EAR_THRESHOLD:
            below = True
        elif below:
            below        = False
            blink_count += 1

    passed = blink_count >= MIN_BLINKS

    logger.info(
        "Blink analysis: frames=%d  blinks=%d  min=%d  passed=%s  threshold=%.2f",
        len(ear_log), blink_count, MIN_BLINKS, passed, EAR_THRESHOLD
    )

    return {
        "passed":      passed,
        "blink_count": blink_count,
        "reason":      (
            f"Blink challenge passed — {blink_count} blink(s) detected."
            if passed
            else f"Insufficient blinks detected: {blink_count}/{MIN_BLINKS}."
        ),
        "min_blinks": MIN_BLINKS
    }


def verify_selfie_face(selfie_bytes: bytes) -> dict:
    """
    Confirm a face is present in the selfie using InsightFace.
    Returns det_score of the best detected face.
    """
    try:
        from app.models.model_registry import ModelRegistry
        face_app = ModelRegistry().get_face()
        img      = cv2.imdecode(
            np.frombuffer(selfie_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )
        if img is None:
            return {"passed": False, "det_score": 0.0, "reason": "Could not decode selfie image."}

        faces = face_app.get(img)

        if not faces:
            return {"passed": False, "det_score": 0.0, "reason": "No face detected in selfie."}

        best_score = max(float(f.det_score) for f in faces)
        passed     = best_score >= 0.50

        logger.info(
            "Selfie face check: faces=%d  best_score=%.3f  passed=%s",
            len(faces), best_score, passed
        )

        return {
            "passed":    passed,
            "det_score": round(best_score, 4),
            "reason":    (
                f"Face confirmed in selfie (score={best_score:.3f})."
                if passed
                else f"Selfie face quality too low (score={best_score:.3f})."
            )
        }

    except Exception as e:
        logger.warning("Selfie face check failed: %s — passing with fallback.", e)
        # Do not block the user if InsightFace fails on selfie check
        return {
            "passed":    True,
            "det_score": 0.75,
            "reason":    "Selfie face check bypassed (model error)."
        }


def verify_liveness(
    ear_log:        List[float],
    challenge_type: str,
    selfie_bytes:   bytes
) -> dict:
    """
    Combined liveness check:
    1. Blink challenge — EAR log analysis
    2. Selfie face presence — InsightFace detection

    Both must pass for overall liveness to pass.
    If ear_log is empty (manual override used), pass with note.
    """
    # ── Blink challenge ───────────────────────────────────────────────
    if ear_log:
        blink_result = verify_blink_challenge(ear_log)
    else:
        # Manual override was used — no EAR data
        # Still verify face is present in selfie
        logger.info("No EAR log — manual override used. Verifying selfie face only.")
        blink_result = {
            "passed":      True,
            "blink_count": 0,
            "reason":      "Manual liveness confirmation accepted.",
            "min_blinks":  MIN_BLINKS
        }

    # ── Selfie face presence ──────────────────────────────────────────
    face_result = verify_selfie_face(selfie_bytes)

    # ── Combined decision ─────────────────────────────────────────────
    passed = blink_result["passed"] and face_result["passed"]

    reason = (
        f"{blink_result['reason']} {face_result['reason']}"
        if passed
        else blink_result["reason"] if not blink_result["passed"]
        else face_result["reason"]
    )

    logger.info(
        "Liveness result: passed=%s  blinks=%d  det_score=%.3f  reason=%s",
        passed,
        blink_result.get("blink_count", 0),
        face_result.get("det_score", 0.0),
        reason
    )

    return {
        "passed":      passed,
        "blink_count": blink_result.get("blink_count", 0),
        "det_score":   face_result.get("det_score",   0.0),
        "reason":      reason
    }