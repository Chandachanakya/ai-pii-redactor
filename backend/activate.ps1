# -----------------------------------------------------------
# Activate the Python virtual environment for this project.
# Usage:  .\activate.ps1
# -----------------------------------------------------------

$venvPath = Join-Path $PSScriptRoot "venv\Scripts\Activate.ps1"

if (Test-Path $venvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & $venvPath
    Write-Host "Virtual environment activated. Python: $(python --version)" -ForegroundColor Cyan
} else {
    Write-Host "venv not found. Creating one..." -ForegroundColor Yellow
    python -m venv (Join-Path $PSScriptRoot "venv")
    & $venvPath
    Write-Host "Virtual environment created and activated." -ForegroundColor Green
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r (Join-Path $PSScriptRoot "requirements.txt")
    Write-Host "Done!" -ForegroundColor Cyan
}
