"""
Text extraction service.
- .txt  → direct decode
- PDF   → pdfplumber
- Image → pytesseract OCR
"""

import io
import pdfplumber


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Decode plain-text file bytes to string."""
    return file_bytes.decode("utf-8", errors="replace")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from image bytes using pytesseract OCR."""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
    except ImportError:
        return "[OCR unavailable] — install Pillow + pytesseract for image support."
    except Exception as e:
        return f"[OCR error] — {e}"
