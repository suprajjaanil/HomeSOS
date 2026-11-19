@echo off
echo ===================================================
echo Starting HomeSOS FastAPI Backend Server...
echo ===================================================
cd /d "%~dp0"
python backend\run.py
pause
