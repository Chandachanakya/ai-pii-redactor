"""
Locked API contract — Pydantic response models for POST /analyze.
DO NOT change this structure without team agreement.
"""

from pydantic import BaseModel
from typing import List


class DetectedEntity(BaseModel):
    type: str
    value: str
    start: int
    end: int


class PIISummary(BaseModel):
    names: int = 0
    emails: int = 0
    phones: int = 0
    aadhaar: int = 0
    pan: int = 0
    locations: int = 0
    ips: int = 0
    dates: int = 0


class AnalyzeResponse(BaseModel):
    file_name: str
    pii_summary: PIISummary
    risk_score: int
    risk_level: str
    detected_entities: List[DetectedEntity]
    redacted_text: str
