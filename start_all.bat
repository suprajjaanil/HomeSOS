@echo off
echo ===================================================
echo Launching HomeSOS (ECHO Track Hackathon Project)
echo ===================================================
cd /d "%~dp0"
start "HomeSOS Backend (FastAPI)" cmd /k "python backend\run.py"
timeout /t 2 /nobreak >nul
start "HomeSOS Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"
echo.
echo HomeSOS is launching!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo ===================================================
