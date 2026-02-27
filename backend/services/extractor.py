"""
Text extraction service.
- .txt  → direct decode
- PDF   → pdfplumber
- Image → OpenCV preprocessing + pytesseract OCR
"""

import io
import logging
import pdfplumber
import numpy as np

logger = logging.getLogger(__name__)


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


def preprocess_image(image_bytes: bytes):
    """
    Applies OpenCV preprocessing to improve OCR accuracy:
    1. Grayscale
    2. Resize (Upscale to ~300 DPI)
    3. Gaussian Blur (Noise reduction)
    4. Thresholding (Binarization)
    """
    import cv2
    from PIL import Image

    # Convert bytes to numpy array for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return None

    # 1. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Resize / Upscale (Tesseract likes larger text)
    # We increase the size by 2x as a heuristic for better DPI
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # 3. Gaussian Blur to remove noise
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # 4. Adaptive Thresholding (Binarization)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Convert back to PIL Image for pytesseract
    return Image.fromarray(thresh)


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from image bytes using optimized pytesseract OCR."""
    try:
        import pytesseract

        # 1. Preprocess for better accuracy
        processed_img = preprocess_image(file_bytes)
        
        if processed_img is None:
            return "[OCR error] — Could not decode image."

        # 2. Extract text with optimized config
        # --oem 3: Default (standard LSTM engine)
        # --psm 6: Assume a single uniform block of text (best for docs)
        custom_config = r'--oem 3 --psm 6'
        extracted_text = pytesseract.image_to_string(
            processed_img, 
            lang='eng', 
            config=custom_config
        )

        # Debug print (repr) as requested to check for hidden characters
        logger.debug(f"Extracted OCR Text: {repr(extracted_text)}")

        return extracted_text.strip()
        
    except ImportError:
        return "[OCR unavailable] — install Pillow + pytesseract + opencv-python for image support."
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        return f"[OCR error] — {e}"
