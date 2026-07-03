from __future__ import annotations

import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)

MIN_RESOLUTION   = 200
MIN_BRIGHTNESS   = 50
MAX_BRIGHTNESS   = 220
MIN_BLUR_SCORE   = 100.0
MAX_LONGEST_SIDE = 1920


def assess_quality(image_bytes: bytes) -> dict:
    """
    Assess document image quality before OCR.

    Checks:
    - Resolution (min 200px each side)
    - Brightness (center region mean, 50–220)
    - Blur (Laplacian variance >= 100)

    Returns:
        {
            passed: bool,
            brightness: float,
            blur_score: float,
            width: int,
            height: int,
            reasons: list[str]
        }
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

    # ── Resolution ────────────────────────────────────────────────────
    if width < MIN_RESOLUTION or height < MIN_RESOLUTION:
        reasons.append(
            f"Resolution too low ({width}x{height}). "
            f"Minimum {MIN_RESOLUTION}px on each side."
        )

    # ── Brightness — sample center 50% of image ───────────────────────
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    center = gray[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
    brightness = float(np.mean(center))

    if brightness < MIN_BRIGHTNESS:
        reasons.append(f"Image too dark (brightness={brightness:.1f}).")
    if brightness > MAX_BRIGHTNESS:
        reasons.append(f"Image overexposed (brightness={brightness:.1f}).")

    # ── Blur — Laplacian variance ─────────────────────────────────────
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    if blur_score < MIN_BLUR_SCORE:
        reasons.append(f"Image too blurry (score={blur_score:.1f}).")

    passed = len(reasons) == 0

    logger.info(
        "Quality assessment: passed=%s width=%d height=%d "
        "brightness=%.1f blur=%.1f reasons=%s",
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
    Apply lightweight corrections to improve OCR accuracy.

    Steps:
    1. Decode image
    2. Resize if longest side > 1920px
    3. Mild sharpening via 3x3 kernel
    4. Return corrected JPEG bytes at 95% quality
    """
    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError("Cannot correct: invalid or corrupted image.")

    height, width = image.shape[:2]
    longest_side  = max(width, height)

    # ── Resize if too large ───────────────────────────────────────────
    if longest_side > MAX_LONGEST_SIDE:
        scale      = MAX_LONGEST_SIDE / float(longest_side)
        new_width  = int(width  * scale)
        new_height = int(height * scale)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        logger.info("Resized document: %dx%d → %dx%d", width, height, new_width, new_height)

    # ── Convert BGR → RGB (PaddleOCR expects RGB) ─────────────────────
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # ── Mild sharpening ───────────────────────────────────────────────
    sharpen_kernel = np.array(
        [[0, -1,  0],
         [-1, 5, -1],
         [0, -1,  0]],
        dtype=np.float32
    )
    image = cv2.filter2D(image, ddepth=-1, kernel=sharpen_kernel)

    # ── Encode back to JPEG bytes ─────────────────────────────────────
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
    Full preprocessing pipeline for a document image.

    1. Assess quality — raises ValueError if image fails any gate.
    2. Apply corrections — resize + sharpen.
    3. Return corrected JPEG bytes ready for OCR and face extraction.
    """
    quality = assess_quality(image_bytes)

    if not quality["passed"]:
        reasons = "; ".join(quality["reasons"])
        logger.warning("Document preprocessing failed: %s", reasons)
        raise ValueError(f"Document quality check failed: {reasons}")

    return correct_document(image_bytes)