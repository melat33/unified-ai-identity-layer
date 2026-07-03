import logging
import re
from typing import Dict, List, Optional

import cv2
import numpy as np

from app.models.model_registry import ModelRegistry

logger = logging.getLogger(__name__)

MONTHS = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"

# No \b boundaries — handles concatenated Fayda dates like 06/06/19922000/Feb/14
LOOSE_DATE_RE = re.compile(
    r"(?:"
    r"\d{2}[/-]\d{2}[/-]\d{4}"
    r"|\d{4}[/-]\d{2}[/-]\d{2}"
    r"|\d{4}/" + MONTHS + r"/\d{2}"
    r"|\d{2}/" + MONTHS + r"/\d{4}"
    r")",
    re.IGNORECASE
)

FAYDA_ID_REGEX = re.compile(r"\b\d{16}\b")
ID_REGEX       = re.compile(r"\b[A-Za-z0-9-]*[0-9][A-Za-z0-9-]*\b")

SKIP_LABELS = {
    "male", "female", "sex", "national id", "nationalid",
    "fayda", "ethiopia", "id card", "ethiopian digital id card",
    "date of birth", "date of expiry", "date of issue",
    "full name", "fullname", "fan"
}

DOB_KEYWORDS    = {"birth", "born"}
EXPIRY_KEYWORDS = {"expiry", "expire", "expiration"}
ISSUE_KEYWORDS  = {"issue", "issued"}


def run_ocr(image_bytes: bytes) -> List[Dict]:
    """
    Run PaddleOCR on raw image bytes.
    Returns [ { "text": str, "confidence": float }, ... ]
    """
    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )
    if image is None:
        raise ValueError("Unable to decode image.")

    ocr    = ModelRegistry().get_ocr()
    result = ocr.ocr(image, cls=True)

    detections = []
    if not result:
        return detections

    for page in result:
        if not page:
            continue
        for line in page:
            if not line or not line[1]:
                continue
            text       = line[1][0].strip()
            confidence = float(line[1][1])
            if text:
                detections.append({ "text": text, "confidence": confidence })

    logger.info("OCR extracted %d text lines.", len(detections))
    return detections


def _extract_all_dates(text: str) -> List[str]:
    """
    Extract all dates from a string including concatenated pairs.
    LOOSE_DATE_RE has no word boundaries so it handles
    '06/06/19922000/Feb/14' correctly — returns both dates.
    """
    return LOOSE_DATE_RE.findall(text)


def _year(date_str: str) -> Optional[int]:
    hits = re.findall(r"\d{4}", date_str)
    return int(hits[0]) if hits else None


def _resolve_dates(source_line: str) -> List[str]:
    """
    Given a raw OCR line that may contain one or two concatenated dates,
    return all extracted dates sorted oldest → newest.
    """
    dates = _extract_all_dates(source_line)
    return sorted(dates, key=lambda d: _year(d) or 0)


def extract_id_fields(image_bytes: bytes) -> Dict:
    """
    Extract structured identity fields from a Fayda National ID.

    Strategy — semantic label detection:
    1. Scan OCR lines for label keywords (Date of Birth / Date of Expiry)
    2. The line immediately following the label contains the date(s)
    3. From the DOB source line — take the Gregorian date (smallest year)
    4. From the expiry source line — take the furthest future date (largest year)
    5. Skip the issue date entirely (it's a separate label)

    This is robust against the year-heuristic failure because we anchor
    dates to their semantic labels rather than inferring meaning from
    the year value alone.
    """
    detections = run_ocr(image_bytes)

    texts       = [d["text"] for d in detections]
    confidences = [d["confidence"] for d in detections]

    logger.info("Raw OCR texts: %s", texts)

    name      = None
    dob       = None
    expiry    = None
    id_number = None
    address   = None

    used = set()

    # ── 1. Build label → next-line map ────────────────────────────────
    # Scan through lines; when a label is found, tag the NEXT line
    # as the source for that field. A line can itself contain the date
    # (e.g. "2017/09/16 Date of lssue") — handle both cases.

    dob_source    = None
    expiry_source = None

    for i, t in enumerate(texts):
        t_lower = t.lower()

        # Issue date — identify and skip so it doesn't pollute DOB/expiry
        if any(kw in t_lower for kw in ISSUE_KEYWORDS) and "birth" not in t_lower:
            logger.info("Skipping issue date line: %s", t)
            used.add(t)
            if i + 1 < len(texts):
                used.add(texts[i + 1])  # also skip the following date line
            continue

        # DOB label
        if any(kw in t_lower for kw in DOB_KEYWORDS):
            # Date may be in this line or the next
            if _extract_all_dates(t):
                dob_source = t
            elif i + 1 < len(texts):
                dob_source = texts[i + 1]
            logger.info("DOB source line: %s", dob_source)
            continue

        # Expiry label
        if any(kw in t_lower for kw in EXPIRY_KEYWORDS):
            if _extract_all_dates(t):
                expiry_source = t
            elif i + 1 < len(texts):
                expiry_source = texts[i + 1]
            logger.info("Expiry source line: %s", expiry_source)
            continue

    # ── 2. Extract DOB from source line ──────────────────────────────
    if dob_source:
        dates = _resolve_dates(dob_source)
        if dates:
            # Gregorian DOB has the smallest year (e.g. 1992 vs 2000)
            dob = dates[0]
            logger.info("DOB resolved: %s", dob)
    else:
        logger.warning("OCR: DOB label not found.")

    # ── 3. Extract expiry from source line ────────────────────────────
    if expiry_source:
        dates = _resolve_dates(expiry_source)
        if dates:
            # Expiry is the furthest future date (e.g. 2033 vs 2025)
            expiry = dates[-1]
            logger.info("Expiry resolved: %s", expiry)
    else:
        logger.warning("OCR: expiry label not found.")

    # ── 4. Fayda ID — 16-digit number ─────────────────────────────────
    for t in texts:
        if t in used:
            continue
        m = FAYDA_ID_REGEX.search(t)
        if m:
            id_number = m.group()
            used.add(t)
            logger.info("Fayda ID found: %s", id_number)
            break

    # ── 5. Fallback ID 
    if not id_number:
        for t in texts:
            if t in used:
                continue
            m = ID_REGEX.search(t)
            if m and 8 <= len(m.group()) <= 20:
                id_number = m.group()
                used.add(t)
                logger.info("Fallback ID found: %s", id_number)
                break

    if not id_number:
        logger.warning("OCR: ID number not found.")

    # ── 6. Name — longest letters+spaces only line ────────────────────
    name_candidates = [
        t for t in texts
        if re.fullmatch(r"[A-Za-z ]{3,}", t)
        and t not in used
        and t.lower().strip() not in SKIP_LABELS
    ]

    if name_candidates:
        name = max(name_candidates, key=len)
        used.add(name)
        logger.info("Name found: %s", name)
    else:
        logger.warning("OCR: name not found.")

    # ── 7. Address — first long unmatched line ────────────────────────
    for t in texts:
        if (
            t not in used
            and len(t) > 15
            and not _extract_all_dates(t)
            and not FAYDA_ID_REGEX.search(t)
        ):
            address = t
            logger.info("Address found: %s", address)
            break

    return {
        "name":              name,
        "dob":               dob,
        "id_number":         id_number,
        "expiry":            expiry,
        "address":           address,
        "raw_texts":         texts,
        "confidence_scores": confidences
    }