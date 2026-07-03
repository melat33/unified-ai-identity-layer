import logging
from dataclasses import dataclass

import cv2
import numpy as np

from app.core.config import settings
from app.models.model_registry import ModelRegistry

logger = logging.getLogger(__name__)


@dataclass
class FaceExtractionResult:
    """
    Result of running face detection + embedding extraction on one image.
    """
    embedding: np.ndarray     # 512-dim L2-normalized embedding (ArcFace R100)
    det_score: float          # detection confidence of the chosen face
    bbox: tuple               # (x1, y1, x2, y2) of the chosen face
    face_count: int           # total number of faces found in the image


def _decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes into a BGR numpy array OpenCV/InsightFace can read.
    """
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(buffer, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image — invalid or corrupted file.")

    return img


def _bbox_area(bbox) -> float:
    x1, y1, x2, y2 = bbox
    return abs((x2 - x1) * (y2 - y1))


def _select_best_face(faces):
    """
    Choose the best face among multiple detections.

    Primary key: detection confidence, rounded to 3 decimals so that
    near-equal confidences are treated as ties rather than relying on
    exact float equality (which almost never happens in practice).

    Secondary key (tiebreaker): bounding box area — prefers the larger,
    more prominent face when confidence is effectively the same.
    """
    def sort_key(face):
        confidence = round(float(face.det_score), 3)
        area = _bbox_area(face.bbox)
        return (confidence, area)

    return max(faces, key=sort_key)


def extract_embedding(image_bytes: bytes) -> FaceExtractionResult:
    """
    Detect the best face in an image and return its ArcFace embedding.

    Raises:
        ValueError: if the image can't be decoded or no face is found.
    """
    img = _decode_image(image_bytes)

    face_app = ModelRegistry().get_face()
    faces = face_app.get(img)

    if not faces:
        raise ValueError("No face detected in image.")

    if len(faces) > 1:
        # Multiple faces can mean a spoofing attempt (second person in
        # frame) or a false positive on a document watermark/pattern.
        # We proceed with the best one but this is worth logging for
        # later fraud-signal analysis.
        logger.warning(
            "Multiple faces detected (%d) — selecting highest-confidence face.",
            len(faces)
        )

    best_face = _select_best_face(faces)

    return FaceExtractionResult(
        embedding=best_face.normed_embedding,  # already L2-normalized
        det_score=float(best_face.det_score),
        bbox=tuple(best_face.bbox),
        face_count=len(faces)
    )


def compare_embeddings(embedding1: np.ndarray, embedding2: np.ndarray) -> dict:
    """
    Compute cosine similarity between two face embeddings and compare
    against the configured match threshold.

    Returns:
        {
            "similarity": float,   # cosine similarity, -1.0 to 1.0
            "match": bool,         # similarity >= FACE_MATCH_THRESHOLD
            "threshold": float
        }
    """
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)

    if norm1 == 0 or norm2 == 0:
        logger.warning("Zero-norm embedding encountered in comparison.")
        return {
            "similarity": 0.0,
            "match": False,
            "threshold": settings.FACE_MATCH_THRESHOLD
        }

    # Computed explicitly (not just a dot product) so this stays correct
    # even if a caller passes raw, non-normalized embeddings.
    raw_similarity = float(np.dot(embedding1, embedding2) / (norm1 * norm2))
    similarity = float(np.clip(raw_similarity, -1.0, 1.0))

    return {
        "similarity": round(similarity, 4),
        "match": similarity >= settings.FACE_MATCH_THRESHOLD,
        "threshold": settings.FACE_MATCH_THRESHOLD
    }