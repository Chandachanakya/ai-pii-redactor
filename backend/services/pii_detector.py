"""
PII detection service.
Combines regex patterns (email, phone, SSN, credit card)
with spaCy NER (PERSON, ORG).
"""

import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
PATTERNS = {
    "EMAIL": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    "PHONE": r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b",
    "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
    "CREDIT_CARD": r"\b(?:\d{4}[-\s]?){3}\d{4}\b",
    "AADHAAR": r"\b\d{4}\s?\d{4}\s?\d{4}\b",
    "PAN": r"\b[A-Z]{5}\d{4}[A-Z]\b",
}

# ---------------------------------------------------------------------------
# spaCy model (lazy-loaded)
# ---------------------------------------------------------------------------
_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy

        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Model not installed — fall back to blank
            logger.warning("spaCy model 'en_core_web_sm' not found. NER disabled.")
            _nlp = spacy.blank("en")
    return _nlp


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def detect_pii(text: str) -> List[Dict]:
    """Return a list of PII entities found in *text*."""
    entities: List[Dict] = []

    # Regex-based detection
    for pii_type, pattern in PATTERNS.items():
        for match in re.finditer(pattern, text):
            # Filter: phone must have at least 10 digits total
            if pii_type == "PHONE":
                digits = re.sub(r"\D", "", match.group())
                if len(digits) < 10:
                    continue
            entities.append(
                {
                    "type": pii_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                }
            )

    # NER-based detection (PERSON, ORG)
    nlp = _get_nlp()
    doc = nlp(text)
    # Map spaCy labels to contract entity types
    LABEL_MAP = {"PERSON": "NAME", "ORG": "ORG", "GPE": "LOCATION"}
    for ent in doc.ents:
        if ent.label_ in LABEL_MAP:
            # Filter: skip very short NER entities (usually noise)
            if len(ent.text.strip()) <= 2:
                continue
            entities.append(
                {
                    "type": LABEL_MAP[ent.label_],
                    "value": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                }
            )

    # Sort by position for consistent redaction
    entities.sort(key=lambda e: e["start"])

    # De-duplicate overlapping spans — more specific type wins
    PRIORITY = {
        "AADHAAR": 10, "PAN": 10, "SSN": 10, "CREDIT_CARD": 9,
        "EMAIL": 8, "PHONE": 7, "LOCATION": 6, "NAME": 5, "ORG": 4,
    }
    deduped: List[Dict] = []
    for ent in entities:
        if deduped and ent["start"] < deduped[-1]["end"]:
            # Overlap — keep whichever has higher priority
            prev = deduped[-1]
            if PRIORITY.get(ent["type"], 0) > PRIORITY.get(prev["type"], 0):
                deduped[-1] = ent
        else:
            deduped.append(ent)

    return deduped
