from __future__ import annotations

import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)

MIN_RESOLUTION   = 200
MIN_BRIGHTNESS   = 50
MAX_BRIGHTNESS   = 220
MIN_BLUR_SCORE   = 20.0
MAX_LONGEST_SIDE = 1920


def _is_face_not_document(image: np.ndarray) -> bool:
    """
    Detect if the image is a selfie rather than an ID document.

    Uses InsightFace (already loaded in ModelRegistry) instead of
    Haar cascade — InsightFace works with masks, glasses, and
    partial faces. Haar cascade fails on masked faces entirely.

    A face occupying more than 15% of frame area = selfie, not document.
    ID cards have small face photos occupying ~5-8% of the card area.
    """
    try:
        from app.models.model_registry import ModelRegistry
        face_app = ModelRegistry().get_face()
        faces    = face_app.get(image)

        if not faces:
            return False

        h, w       = image.shape[:2]
        image_area = h * w

        for face in faces:
            x1, y1, x2, y2 = face.bbox
            face_area       = abs((x2 - x1) * (y2 - y1))
            face_ratio      = face_area / image_area
            det_score       = float(face.det_score)

            logger.info(
                "Face detected: det_score=%.3f area_ratio=%.3f",
                det_score, face_ratio
            )

            # A real document has a small face photo (< 15% area)
            # A selfie has a large face (> 15% area)
            # Only flag as selfie if face is large AND confident
            if face_ratio > 0.15 and det_score > 0.60:
                logger.warning(
                    "Selfie detected: face_ratio=%.1f%% det_score=%.3f — rejecting",
                    face_ratio * 100, det_score
                )
                return True

        return False

    except Exception as e:
        logger.warning("Face-in-document check error: %s — allowing image", e)
        return False  # if check fails, don't block the user


def assess_quality(image_bytes: bytes) -> dict:
    """
    Assess document image quality before OCR.

    Checks (in order):
    1. Resolution  — min 200px each side
    2. Brightness  — center region mean, 50–220
    3. Blur        — Laplacian variance >= 20
    4. Not selfie  — face must not dominate the frame
    """
    reasons = []

    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "passed":     False,
            "brightness": 0.0,
            "blur_score": 0.0,
            "width":      0,
            "height":     0,
            "reasons":    ["Invalid or corrupted image."]
        }

    height, width = image.shape[:2]

    # ── 1. Resolution ─────────────────────────────────────────────────
    if width < MIN_RESOLUTION or height < MIN_RESOLUTION:
        reasons.append(
            f"Resolution too low ({width}x{height}). "
            f"Minimum {MIN_RESOLUTION}px on each side."
        )

    # ── 2. Brightness ─────────────────────────────────────────────────
    gray   = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w   = gray.shape
    center = gray[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
    brightness = float(np.mean(center))

    if brightness < MIN_BRIGHTNESS:
        reasons.append(
            f"Image too dark (brightness={brightness:.1f}). "
            "Move to a brighter area or turn on a light."
        )
    if brightness > MAX_BRIGHTNESS:
        reasons.append(
            f"Image overexposed (brightness={brightness:.1f}). "
            "Reduce direct light on the document."
        )

    # ── 3. Blur ───────────────────────────────────────────────────────
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    if blur_score < MIN_BLUR_SCORE:
        reasons.append(
            f"Image too blurry (score={blur_score:.1f}). "
            "Hold the document steady and ensure it is in focus."
        )

    # ── 4. Selfie detection ───────────────────────────────────────────
    # Only run if other checks pass — avoid extra inference on bad images
    if not reasons:
        if _is_face_not_document(image):
            reasons.append(
                "This looks like a selfie photo. "
                "Please place your Fayda ID card or passport flat "
                "in front of the camera — not your face."
            )

    passed = len(reasons) == 0

    logger.info(
        "Quality check: passed=%s size=%dx%d brightness=%.1f blur=%.1f reasons=%s",
        passed, width, height, brightness, blur_score, reasons
    )

    return {
        "passed":     passed,
        "brightness": brightness,
        "blur_score": blur_score,
        "width":      width,
        "height":     height,
        "reasons":    reasons
    }


def correct_document(image_bytes: bytes) -> bytes:
    """
    Apply corrections to improve OCR accuracy:
    1. Resize if longest side > 1920px
    2. BGR → RGB (PaddleOCR expects RGB)
    3. Mild sharpening
    4. Re-encode as JPEG 95%
    """
    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError("Cannot correct: invalid or corrupted image.")

    height, width = image.shape[:2]
    longest_side  = max(width, height)

    if longest_side > MAX_LONGEST_SIDE:
        scale      = MAX_LONGEST_SIDE / float(longest_side)
        new_w      = int(width  * scale)
        new_h      = int(height * scale)
        image      = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        logger.info("Resized: %dx%d → %dx%d", width, height, new_w, new_h)

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    sharpen = np.array(
        [[0, -1,  0],
         [-1, 5, -1],
         [0, -1,  0]],
        dtype=np.float32
    )
    image = cv2.filter2D(image, ddepth=-1, kernel=sharpen)

    success, encoded = cv2.imencode(
        ".jpg",
        cv2.cvtColor(image, cv2.COLOR_RGB2BGR),
        [cv2.IMWRITE_JPEG_QUALITY, 95]
    )

    if not success:
        raise ValueError("Failed to encode corrected image.")

    logger.info("Document correction complete.")
    return encoded.tobytes()


def preprocess(image_bytes: bytes) -> bytes:
    """
    Full preprocessing: assess quality, then correct.
    Raises ValueError with user-readable message if quality fails.
    """
    quality = assess_quality(image_bytes)

    if not quality["passed"]:
        reasons = "; ".join(quality["reasons"])
        logger.warning("Preprocessing failed: %s", reasons)
        raise ValueError(f"Document quality check failed: {reasons}")

    return correct_document(image_bytes)