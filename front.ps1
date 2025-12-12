# Iniciar solo el frontend (Vite/React) en PowerShell
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias frontend..."
    npm install
}
Write-Host "==============================="
Write-Host "Frontend corriendo en http://localhost:5173"
Write-Host "Para detener el servicio presiona CTRL+C"
Write-Host "==============================="
npm run dev
