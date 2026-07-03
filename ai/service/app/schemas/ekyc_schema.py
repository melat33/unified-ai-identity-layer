from pydantic import BaseModel, ConfigDict, Field


class EKYCRequest(BaseModel):
    """
    Request payload for full eKYC verification.
    """
    model_config = ConfigDict(from_attributes=True)

    session_id:     str
    doc_image:      str = Field(
        ...,
        description="Base64-encoded JPEG of the identity document."
    )
    selfie:         str = Field(
        ...,
        description="Base64-encoded JPEG captured during liveness challenge."
    )
    ear_log:        list[float] = Field(
        default_factory=list,
        description="Eye Aspect Ratio values collected during blink detection."
    )
    challenge_type: str = Field(
        default="blink",
        description="Liveness challenge type — blink or turn."
    )


class OCRFields(BaseModel):
    """
    Structured fields extracted from the identity document via PaddleOCR.
    All fields are optional — OCR may not find every field on every document.
    """
    model_config = ConfigDict(from_attributes=True)

    name:      str | None = None
    dob:       str | None = None
    id_number: str | None = None
    expiry:    str | None = None
    address:   str | None = None


class EKYCResponse(BaseModel):
    """
    Response returned after full eKYC verification pipeline.
    """
    model_config = ConfigDict(from_attributes=True)

    session_id:      str
    kyc_passed:      bool
    face_similarity: float
    face_match:      bool
    liveness_passed: bool
    liveness_reason: str
    blink_count:     int
    det_score:       float
    ocr_fields:      OCRFields
    error:           str | None = None


class ReauthRequest(BaseModel):
    """
    Request payload for biometric re-authentication.
    Used when a returning user must re-verify before a sensitive action.
    """
    model_config = ConfigDict(from_attributes=True)

    session_id:     str
    selfie:         str = Field(
        ...,
        description="Base64-encoded live selfie."
    )
    ear_log:        list[float] = Field(
        default_factory=list,
        description="EAR values captured during blink detection."
    )
    challenge_type: str = Field(
        default="blink",
        description="Liveness challenge type."
    )


class ReauthResponse(BaseModel):
    """
    Response returned after biometric re-authentication.
    """
    model_config = ConfigDict(from_attributes=True)

    passed:     bool
    similarity: float
    det_score:  float
    reason:     str