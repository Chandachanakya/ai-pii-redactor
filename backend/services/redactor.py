"""
Redaction service.
Replaces detected PII spans with [REDACTED] labels.
"""

from typing import List, Dict


def redact_text(text: str, pii_entities: List[Dict]) -> str:
    """
    Replace each PII span in *text* with a tag like [REDACTED_EMAIL].
    Processes spans in reverse order so earlier indices stay valid.
    """
    # Work on a mutable list of characters (or just string slicing)
    redacted = text

    # Process in reverse order to preserve earlier indices
    for entity in sorted(pii_entities, key=lambda e: e["start"], reverse=True):
        label = f"[REDACTED_{entity['type']}]"
        redacted = redacted[: entity["start"]] + label + redacted[entity["end"] :]

    return redacted
