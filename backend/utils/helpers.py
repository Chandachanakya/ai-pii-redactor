"""
Utility / helper functions.
"""

import os

# Supported file extensions
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}
PDF_EXTENSIONS = {".pdf"}
TEXT_EXTENSIONS = {".txt", ".csv"}


def get_file_type(filename: str) -> str:
    """Return 'pdf', 'image', or 'unknown' based on file extension."""
    if not filename:
        return "unknown"

    ext = os.path.splitext(filename)[1].lower()

    if ext in PDF_EXTENSIONS:
        return "pdf"
    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in TEXT_EXTENSIONS:
        return "text"
    return "unknown"
