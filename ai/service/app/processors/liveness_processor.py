from __future__ import annotations

import logging

import cv2
import numpy as np

from app.core.config import settings
from app.models.model_registry import ModelRegistry

logger = logging.getLogger(__name__)


def verify_blink_challenge(
    ear_log: list[float],
    challenge_type: str
) -> dict:
    """
    Verify a blink challenge using EAR values computed in the browser.

    A completed blink is defined as:
        EAR above threshold  →  EAR drops below threshold  →  EAR returns above threshold

    The frontend sends the raw EAR log rather than a blink count so the
    server can verify the sequence independently — a spoofed client
    cannot fake a realistic EAR time series without a real face.

    Returns:
        {
            passed: bool,
            blink_count: int,
            min_ear: float,
            reason: str
        }
    """
    if not ear_log or len(ear_log) < 10:
        logger.warning(
            "Liveness: EAR log too short (%d frames).",
            len(ear_log) if ear_log else 0
        )
        return {
            "passed":      False,
            "blink_count": 0,
            "min_ear":     None,
            "reason":      "EAR log too short — minimum 10 frames required."
        }

    threshold   = settings.LIVENESS_EAR_THRESHOLD
    blink_count = 0
    eye_closed  = False
    min_ear     = float(min(ear_log))

    for ear in ear_log:
        if not eye_closed and ear < threshold:
            eye_closed = True                      # eye started closing
        elif eye_closed and ear >= threshold:
            blink_count += 1                       # eye reopened — blink complete
            eye_closed  = False

    passed = blink_count >= settings.LIVENESS_BLINKS_REQUIRED

    logger.info(
        "Blink challenge: count=%d required=%d min_ear=%.3f passed=%s",
        blink_count,
        settings.LIVENESS_BLINKS_REQUIRED,
        min_ear,
        passed
    )

    return {
        "passed":      passed,
        "blink_count": blink_count,
        "min_ear":     min_ear,
        "reason":      (
            "Blink challenge passed."
            if passed
            else f"Only {blink_count} of {settings.LIVENESS_BLINKS_REQUIRED} required blinks detected."
        )
    }


def verify_liveness(
    ear_log:       list[float],
    challenge_type: str,
    selfie_bytes:  bytes
) -> dict:
    """
    Full liveness verification — two-stage check:

    Stage 1 — EAR log verification: confirms a real blink sequence
    from the MediaPipe landmark data sent by the browser.

    Stage 2 — Selfie face detection: confirms InsightFace can find a
    real human face in the captured selfie with sufficient confidence.

    Both stages must pass. Stage 2 failing means the selfie was not
    usable regardless of the EAR log result.

    Returns:
        {
            passed:         bool,
            blink_count:    int,
            min_ear:        float | None,
            face_detected:  bool,
            det_score:      float,
            reason:         str
        }
    """
    # ── Stage 1 — EAR blink verification ──────────────────────────────
    blink_result = verify_blink_challenge(ear_log, challenge_type)

    # ── Stage 2 — Selfie face detection ───────────────────────────────
    image = cv2.imdecode(
        np.frombuffer(selfie_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    if image is None:
        logger.warning("Liveness: selfie image could not be decoded.")
        return {
            "passed":        False,
            "blink_count":   blink_result["blink_count"],
            "min_ear":       blink_result["min_ear"],
            "face_detected": False,
            "det_score":     0.0,
            "reason":        "Selfie image is invalid or corrupted."
        }

    # Use the singleton — no second model load
    face_app   = ModelRegistry().get_face()
    faces      = face_app.get(image)

    face_detected = False
    det_score     = 0.0

    if faces:
        best = max(faces, key=lambda f: f.det_score)
        det_score     = float(best.det_score)
        face_detected = det_score > 0.7
        logger.info(
            "Liveness selfie: %d face(s) detected, best det_score=%.3f",
            len(faces),
            det_score
        )
    else:
        logger.warning("Liveness: no faces detected in selfie.")

    # ── Combine results ────────────────────────────────────────────────
    if not face_detected:
        return {
            "passed":        False,
            "blink_count":   blink_result["blink_count"],
            "min_ear":       blink_result["min_ear"],
            "face_detected": False,
            "det_score":     det_score,
            "reason":        f"No confident face in selfie (score={det_score:.2f}, required >0.70)."
        }

    if not blink_result["passed"]:
        return {
            "passed":        False,
            "blink_count":   blink_result["blink_count"],
            "min_ear":       blink_result["min_ear"],
            "face_detected": True,
            "det_score":     det_score,
            "reason":        blink_result["reason"]
        }

    logger.info("Liveness verification passed.")

    return {
        "passed":        True,
        "blink_count":   blink_result["blink_count"],
        "min_ear":       blink_result["min_ear"],
        "face_detected": True,
        "det_score":     det_score,
        "reason":        "Liveness verification passed."
    }