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
    "IP": r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b",
    "DATE": r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b",
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
# Validation Helpers
# ---------------------------------------------------------------------------
def is_valid_entity(ent_type: str, value: str) -> bool:
    """Heuristic rules to filter out false positives."""
    text = value.strip()
    lower_text = text.lower()
    
    # 1. Ignore very short tokens (noise)
    if len(text) <= 2:
        return False
        
    # 2. Ignore placeholder labels/keywords
    ignore_keywords = {"name", "address", "phone", "email", "location", "organization", "aadhaar", "pan", "ssn"}
    if lower_text in ignore_keywords:
        return False
        
    # 3. Ignore tokens ending with colons (likely placeholders like "Name:")
    if text.endswith(":"):
        return False

    # 4. Type-specific validation
    if ent_type == "NAME":
        # Personal names usually have at least two parts
        parts = text.split()
        if len(parts) < 2:
            return False
        # Ignore if it looks like a single common word or is all digits
        if text.isdigit():
            return False

    if ent_type == "EMAIL":
        if "@" not in text or "." not in text:
            return False

    if ent_type == "PHONE":
        digits = re.sub(r"\D", "", text)
        if len(digits) < 10:
            return False

    return True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def detect_pii(text: str, enabled_types: List[str] = None) -> List[Dict]:
    """Return a list of PII entities found in *text*, optionally filtered by type."""
    raw_entities: List[Dict] = []

    # Map mapping backend types to pattern keys
    # PATTERNS keys: EMAIL, PHONE, SSN, CREDIT_CARD, AADHAAR, PAN
    # NER labels: PERSON -> NAME, ORG -> ORG, GPE -> LOCATION
    
    # If no types provided, assume all are enabled
    if enabled_types is None:
        enabled_types = list(PATTERNS.keys()) + ["NAME", "ORG", "LOCATION"]

    # Regex-based detection
    for pii_type, pattern in PATTERNS.items():
        if pii_type not in enabled_types:
            continue
            
        for match in re.finditer(pattern, text):
            raw_entities.append(
                {
                    "type": pii_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                }
            )

    # NER-based detection (PERSON, ORG, LOCATION)
    nlp = _get_nlp()
    doc = nlp(text)
    # Map spaCy labels to contract entity types
    LABEL_MAP = {"PERSON": "NAME", "ORG": "ORG", "GPE": "LOCATION"}
    for ent in doc.ents:
        if ent.label_ in LABEL_MAP:
            pii_type = LABEL_MAP[ent.label_]
            if pii_type not in enabled_types:
                continue
                
            raw_entities.append(
                {
                    "type": pii_type,
                    "value": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                }
            )

    # Apply validation heuristics
    entities = [e for e in raw_entities if is_valid_entity(e["type"], e["value"])]

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
