"""
Risk scoring service.
Returns a 0–100 score and severity level based on PII findings.
"""

from typing import List, Dict
from collections import Counter

# Weights per the spec: Aadhaar → 5, PAN → 4, Email → 3, Phone → 2, Name → 1
PII_WEIGHTS = {
    "AADHAAR": 5,
    "PAN": 4,
    "SSN": 5,
    "CREDIT_CARD": 4,
    "EMAIL": 3,
    "PHONE": 2,
    "NAME": 1,
    "LOCATION": 1,
    "ORG": 1,
}


def calculate_risk_score(pii_entities: List[Dict]) -> Dict:
    """
    Calculate a risk score based on the type and count of PII found.
    Thresholds: 0–10 → Low, 11–25 → Medium, 25+ → High
    """
    if not pii_entities:
        return {
            "score": 0,
            "level": "LOW",
            "total_pii_count": 0,
            "breakdown": {},
        }

    # Count by type
    type_counts = Counter(e["type"] for e in pii_entities)

    # Weighted score
    raw_score = sum(
        count * PII_WEIGHTS.get(pii_type, 1)
        for pii_type, count in type_counts.items()
    )

    # Clamp to 0-100
    score = min(raw_score, 100)

    # Severity level: 0–10 Low, 11–25 Medium, 25+ High
    if score > 25:
        level = "HIGH"
    elif score > 10:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": score,
        "level": level,
        "total_pii_count": len(pii_entities),
        "breakdown": dict(type_counts),
    }
