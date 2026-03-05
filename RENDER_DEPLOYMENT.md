# 🚀 Deployment Guide: Render (Native Python)

This guide provides step-by-step instructions to deploy the AI PII Redactor to [Render](https://render.com) using the Native Python runtime.

## 1. Backend Deployment (Web Service)

### Steps:
1.  **Create a Render Account**: Sign up at [dashboard.render.com](https://dashboard.render.com).
2.  **New Web Service**: Click **New +** > **Web Service**.
3.  **Connect Repository**: Connect your GitHub/GitLab repository.
4.  **Configure Web Service**:
    *   **Name**: `ai-pii-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `./build.sh`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    *   `CORS_ORIGINS`: `https://your-frontend-url.onrender.com`
    *   `LOG_LEVEL`: `INFO`
6.  **Deploy**: Click **Create Web Service**.

> [!IMPORTANT]
> **Why we use Python 3.11**: Some libraries (like `spacy`) require Python 3.11 for the latest features. I've added a `.python-version` file to the `backend/` folder to tell Render to use 3.11.

---

## 2. Frontend Deployment (Static Site)

1.  **New Static Site**: Click **New +** > **Static Site**.
2.  **Connect Repository**: Connect the same repository.
3.  **Configure Static Site**:
    *   **Name**: `ai-pii-redactor`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com`
5.  **Deploy**: Click **Create Static Site**.

---

## 🛠️ Troubleshooting

- **Build Failures**: Ensure the `backend/build.sh` file has execute permissions (`chmod +x build.sh`) before pushing to GitHub.
- **Dependency Errors**: Ensure only backend packages are in `backend/requirements.txt`. (Frontend packages like `recharts` should NOT be there).
- **CORS Errors**: Double-check that `CORS_ORIGINS` on the backend matches your frontend URL exactly.
