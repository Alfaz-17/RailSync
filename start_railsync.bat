@echo off
title RailSync Launcher
echo ===================================================
echo   RailSync - AI-Powered Block Planning System
echo   Starting Python Solver (8787) ^& Next.js (3000)
echo ===================================================
echo.

:: 1. Start Python FastAPI Solver on port 8787 in a new window
echo [1/2] Launching Python Google OR-Tools Solver on http://127.0.0.1:8787 ...
start "RailSync Python Solver (Port 8787)" cmd /k "cd /d %~dp0solver && python -m uvicorn server:app --host 127.0.0.1 --port 8787 --reload"

:: 2. Wait 2 seconds
timeout /t 2 /nobreak >nul

:: 3. Start Next.js Frontend on port 3000 in a new window
echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "RailSync Next.js Frontend (Port 3000)" cmd /k "cd /d %~dp0railsync-prototype && npm run dev"

echo.
echo ===================================================
echo   Both servers launched successfully!
echo   Open your browser at: http://localhost:3000
echo ===================================================
timeout /t 5
