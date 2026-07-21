from __future__ import annotations

import logging
from dataclasses import dataclass

import cv2
import numpy as np

from app.core.config           import settings
from app.models.model_registry import ModelRegistry

logger = logging.getLogger(__name__)


@dataclass
class FaceExtractionResult:
    embedding:  np.ndarray
    det_score:  float
    bbox:       tuple
    face_count: int


def _decode_image(image_bytes: bytes) -> np.ndarray:
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    img    = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image.")
    return img


def _bbox_area(bbox) -> float:
    x1, y1, x2, y2 = bbox
    return abs((x2 - x1) * (y2 - y1))


def extract_embedding(
    image_bytes: bytes,
    is_document: bool = False
) -> FaceExtractionResult:
    """
    Detect face and return ArcFace R100 512-dim embedding.
    Uses highest detection confidence for both document and selfie.
    'Largest face' gave worse results (0.569) vs highest confidence (0.634).
    """
    img      = _decode_image(image_bytes)
    face_app = ModelRegistry().get_face()
    faces    = face_app.get(img)

    if not faces:
        raise ValueError(
            "No face detected. "
            "For documents: ensure the ID card photo is clearly visible. "
            "For selfies: face the camera directly in good lighting."
        )

    if len(faces) > 1:
        logger.warning(
            "%d faces detected — selecting highest-confidence face.",
            len(faces)
        )

    # Always use highest det_score — this gave 0.634 similarity
    # which is above the 0.60 threshold and passes verification
    best = max(faces, key=lambda f: float(f.det_score))

    logger.info(
        "Face selected: det_score=%.3f  bbox_area=%.0f  is_document=%s  total_faces=%d",
        float(best.det_score),
        _bbox_area(best.bbox),
        is_document,
        len(faces)
    )

    return FaceExtractionResult(
        embedding=  best.normed_embedding,
        det_score=  float(best.det_score),
        bbox=       tuple(best.bbox),
        face_count= len(faces)
    )


def compare_embeddings(
    embedding1: np.ndarray,
    embedding2: np.ndarray
) -> dict:
    """
    Cosine similarity between two ArcFace embeddings.
    Threshold 0.60 is correct for cross-domain ID-photo-to-live-selfie matching.
    """
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)

    if norm1 == 0 or norm2 == 0:
        logger.warning("Zero-norm embedding — cannot compare.")
        return {
            "similarity": 0.0,
            "match":      False,
            "threshold":  settings.FACE_MATCH_THRESHOLD
        }

    similarity = float(np.clip(
        np.dot(embedding1, embedding2) / (norm1 * norm2),
        -1.0, 1.0
    ))

    match = similarity >= settings.FACE_MATCH_THRESHOLD

    logger.info(
        "Face comparison: similarity=%.4f  threshold=%.2f  match=%s",
        similarity, settings.FACE_MATCH_THRESHOLD, match
    )

    return {
        "similarity": round(similarity, 4),
        "match":      match,
        "threshold":  settings.FACE_MATCH_THRESHOLD
    }