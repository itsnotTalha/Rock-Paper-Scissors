@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           ROCK PAPER SCISSORS AI - ARCADE LAUNCHER            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Check for Python
set "PYTHON_CMD="
where python >nul 2>nul
if %errorlevel% eq 0 (
    set "PYTHON_CMD=python"
) else (
    where python3 >nul 2>nul
    if %errorlevel% eq 0 (
        set "PYTHON_CMD=python3"
    ) else (
        echo [ERROR] Python is not installed or not in your PATH.
        echo Please install Python 3 and add it to your system environment variables.
        pause
        exit /b 1
    )
)

:: Check for Node.js / npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in your PATH.
    echo Please install Node.js (which includes npm) from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Starting Backend (FastAPI)...
cd /d "%PROJECT_DIR%backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    "%PYTHON_CMD%" -m venv venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
)

call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

echo Installing backend dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

start "RPS_Backend" python main.py
echo ✓ Backend started (http://localhost:8000)
timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend (Vite)...
cd /d "%PROJECT_DIR%frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
)

start "RPS_Frontend" npm run dev
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
echo Press any key to stop all servers and exit...
pause > nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq RPS_Backend" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq RPS_Frontend" /T /F > nul 2>&1
echo Goodbye!
