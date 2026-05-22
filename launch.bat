#!/bin/bash

# Rock Paper Scissors AI - Arcade Game Launcher (Windows)
# This script starts both the backend and frontend servers

@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           ROCK PAPER SCISSORS AI - ARCADE LAUNCHER            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/2] Starting Backend (FastAPI)...
cd /d "%PROJECT_DIR%backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

pip install -q -r requirements.txt > nul 2>&1

start "Backend Server" python main.py
echo ✓ Backend started (http://localhost:8000)
timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend (Vite)...
cd /d "%PROJECT_DIR%frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install > nul 2>&1
)

start "Frontend Server" npm run dev
echo ✓ Frontend started (http://localhost:5173)
timeout /t 3 /nobreak > nul

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✓ All servers running successfully!               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop the servers.
pause
