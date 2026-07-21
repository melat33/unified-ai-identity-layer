from __future__ import annotations
from typing   import Optional
from pydantic import BaseModel


class EKYCRequest(BaseModel):
    session_id:     str
    doc_image:      str
    selfie:         str
    ear_log:        list             = []
    challenge_type: str              = "blink"
    cached_ocr:     Optional[dict]   = None


class OCRFields(BaseModel):
    name:      Optional[str] = None
    dob:       Optional[str] = None
    id_number: Optional[str] = None
    expiry:    Optional[str] = None
    address:   Optional[str] = None


class EKYCResponse(BaseModel):
    session_id:      str
    kyc_passed:      bool
    face_similarity: float
    face_match:      bool
    liveness_passed: bool
    liveness_reason: str
    blink_count:     int
    det_score:       float
    ocr_fields:      Optional[OCRFields] = None
    error:           Optional[str]       = None


class ReauthRequest(BaseModel):
    session_id:     str
    selfie:         str
    ear_log:        list = []
    challenge_type: str  = "blink"


class ReauthResponse(BaseModel):
    passed:     bool
    similarity: float
    det_score:  float
    reason:     str