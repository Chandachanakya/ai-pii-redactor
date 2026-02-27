from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from collections import Counter
import logging

from api.schemas import AnalyzeResponse, PIISummary, DetectedEntity
from services.extractor import extract_text_from_pdf, extract_text_from_image, extract_text_from_txt
from services.pii_detector import detect_pii
from services.redactor import redact_text
from services.risk_scoring import calculate_risk_score
from utils.helpers import get_file_type

logger = logging.getLogger(__name__)

router = APIRouter()

# 10 MB file size limit
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Accept raw text OR a file (PDF / image / txt).
    Returns the locked contract: file_name, pii_summary, risk_score,
    risk_level, detected_entities, redacted_text.
    """

    # --- 1. Get raw text & file name ----------------------------------------
    file_name = "raw_text"

    if file:
        file_name = file.filename or "uploaded_file"
        contents = await file.read()

        # --- Guard: empty file ----------------------------------------------
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        # --- Guard: file size limit -----------------------------------------
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)}MB.",
            )

        file_type = get_file_type(file.filename)

        # --- Guard: unsupported format --------------------------------------
        if file_type == "unknown":
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: '{file.filename}'. Supported: .pdf, .txt, .csv, .png, .jpg, .jpeg, .bmp, .tiff, .webp",
            )

        # --- Extract text with error handling -------------------------------
        try:
            if file_type == "pdf":
                raw_text = extract_text_from_pdf(contents)
            elif file_type == "image":
                raw_text = extract_text_from_image(contents)
            elif file_type == "text":
                raw_text = extract_text_from_txt(contents)
        except Exception as e:
            logger.error(f"Text extraction failed for {file_name}: {e}")
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text from '{file_name}': {str(e)}",
            )

        # --- Guard: no text extracted ---------------------------------------
        if not raw_text or not raw_text.strip():
            raise HTTPException(
                status_code=422,
                detail=f"No readable text found in '{file_name}'. The file may be empty, scanned without OCR support, or corrupted.",
            )

    elif text:
        # --- Guard: blank text input ----------------------------------------
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Provided text is empty or blank.",
            )
        raw_text = text
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'text' or a 'file' upload.",
        )

    # --- 2. Detect PII (with NLP error handling) ----------------------------
    try:
        pii_entities = detect_pii(raw_text)
    except Exception as e:
        logger.error(f"PII detection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"PII detection engine error: {str(e)}",
        )

    # --- 3. Redact ----------------------------------------------------------
    try:
        redacted = redact_text(raw_text, pii_entities)
    except Exception as e:
        logger.error(f"Redaction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Redaction engine error: {str(e)}",
        )

    # --- 4. Risk score ------------------------------------------------------
    risk = calculate_risk_score(pii_entities)

    # --- 5. Build pii_summary counts ----------------------------------------
    type_counts = Counter(e["type"] for e in pii_entities)

    pii_summary = PIISummary(
        names=type_counts.get("NAME", 0),
        emails=type_counts.get("EMAIL", 0),
        phones=type_counts.get("PHONE", 0),
        aadhaar=type_counts.get("AADHAAR", 0),
        pan=type_counts.get("PAN", 0),
        locations=type_counts.get("LOCATION", 0),
    )

    # --- 6. Locked response -------------------------------------------------
    return AnalyzeResponse(
        file_name=file_name,
        pii_summary=pii_summary,
        risk_score=risk["score"],
        risk_level=risk["level"].capitalize(),   # "High" / "Medium" / "Low"
        detected_entities=[DetectedEntity(**e) for e in pii_entities],
        redacted_text=redacted,
    )
