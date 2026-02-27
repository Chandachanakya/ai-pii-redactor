# 🛡️ AI PII Redactor

An enterprise-grade, privacy-first tool to detect and redact Personally Identifiable Information (PII) from public datasets and documents. Built with a high-performance FastAPI backend and a stunning, responsive React frontend.

Developed By: 
Ankita (UI/UX and Frontend Developer), 
A. Ashwini (Backend API Developer and OCR Processing Pipeline),
Ch. Chanakya (Team lead, System Architecture Design and Backend API Developer)

## 🚀 Features

- **Multi-Format Support**: Process `.txt`, `.pdf`, and images (OCR capability).
- **Hybrid Detection Engine**:
  - **Regex Layer**: Deterministic detection for Emails, Phone Numbers, Aadhaar (India), PAN (India), SSN (US), and Credit Cards.
  - **NLP Layer (spaCy)**: Statistical detection for Names, Organizations, and Locations.
- **Smart Redaction**: Replace sensitive spans with type-specific placeholders (e.g., `[REDACTED_EMAIL]`) without breaking text flow.
- **Risk Scoring**: Real-time risk assessment based on entity density and sensitivity weights.
- **Interactive UI**:
  - **Dark Mode**: Premium, enterprise-focused glassmorphism design.
  - **Real-time Progress**: Visual feedback during upload, analysis, and redaction stages.
  - **PII Toggles**: Granular control over which entity types to detect.
- **Advanced Export Options**:
  - **PDF Compliance Report**: Professional summary for GDPR/DPDP audits.
  - **JSON/CSV Reports**: Machine-readable audit logs.
  - **Redacted File**: Download the clean version of your document.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **NLP**: spaCy (`en_core_web_sm`)
- **Document Processing**: PyPDF2, pdfplumber
- **Validation**: Pydantic

### Frontend
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **Visualization**: Recharts
- **Notifications**: Sonner

## 📦 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃 Running the Project

### Start Backend
```bash
cd backend
.\venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

## 🔐 Privacy & Security
- **Stateless Architecture**: No files or PII are stored on the server.
- **In-Memory Processing**: Analysis happens in volatile memory.
- **Automatic Deletion**: All uploaded buffers are cleared immediately after the response is sent.

## 📄 License
This project is developed for hackathon purposes. All rights reserved.
