# Iniciar solo el backend (FastAPI) en PowerShell
if (!(Test-Path "server/Scripts/Activate.ps1")) {
    Write-Host "Creando entorno virtual backend..."
    python -m venv server
}
. ./server/Scripts/Activate.ps1
if (!(Test-Path "server/Lib/site-packages/fastapi")) {
    Write-Host "Instalando dependencias backend..."
    pip install --upgrade pip
    pip install -r requirements.txt
    pip install -r backend/requirements.txt
    pip install uvicorn
}
Write-Host "==============================="
Write-Host "Python: $(python --version)"
Write-Host "Backend corriendo en http://127.0.0.1:8000"
Write-Host "Para detener el servicio presiona CTRL+C"
Write-Host "==============================="
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
