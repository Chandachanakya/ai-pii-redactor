from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="AI PII Redactor",
    description="Detect and redact PII from text, PDFs, and images",
    version="1.0.0",
)

# CORS — allow all origins for hackathon dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI PII Redactor API is running"}
