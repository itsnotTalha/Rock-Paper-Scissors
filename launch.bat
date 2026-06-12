@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0

echo.
echo ==================================================================
echo              ROCK PAPER SCISSORS AI - ARCADE LAUNCHER            
echo ==================================================================
echo.

:: 1. CHECK FOR PYTHON
set "PYTHON_CMD="
where python >nul 2>nul
if %errorlevel% == 0 (
    set "PYTHON_CMD=python"
    goto :found_python
)

where python3 >nul 2>nul
if %errorlevel% == 0 (
    set "PYTHON_CMD=python3"
    goto :found_python
)

echo [ERROR] Python is not installed or not in your PATH.
echo Please install Python 3 and try again.
pause
exit /b 1

:found_python

:: 2. CHECK FOR NODE/NPM
where npm >nul 2>nul
if %errorlevel% NEQ 0 (
    echo [ERROR] Node.js / npm is not installed or not in your PATH.
    pause
    exit /b 1
)

:: 3. START BACKEND (FastAPI)
echo [1/2] Starting Backend (FastAPI)...
cd /d "%PROJECT_DIR%backend"

:: If venv doesn't exist, try creating it with standard venv
if exist "venv" goto :backend_ready
echo Creating Python virtual environment...
"%PYTHON_CMD%" -m venv venv
if %errorlevel% == 0 goto :backend_ready

:: Fallback if standard venv fails (pip install virtualenv)
echo [WARNING] Default venv failed. Attempting virtualenv fallback...
"%PYTHON_CMD%" -m pip install --user --upgrade pip setuptools virtualenv
"%PYTHON_CMD%" -m virtualenv venv

if %errorlevel% NEQ 0 (
    echo [ERROR] Failed to create Python virtual environment.
    pause
    exit /b 1
)

:backend_ready
call venv\Scripts\activate.bat
echo Installing/Checking backend dependencies...
pip install -r requirements.txt

:: Launch Backend in a hidden/minimized window or new title block
start "RPS_Backend" python main.py
echo ✓ Backend started (http://localhost:8000)
timeout /t 2 /nobreak > nul


:: 4. START FRONTEND (Vite)
echo [2/2] Starting Frontend (Vite)...
cd /d "%PROJECT_DIR%frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

start "RPS_Frontend" npm run dev
echo ✓ Frontend started (http://localhost:5173)
timeout /t 2 /nobreak > nul


:: 5. SUCCESS & CLEANUP HANDLER
echo.
echo ==================================================================
echo                  All servers running successfully!               
echo ==================================================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo To stop all servers and exit, close this window or press Enter.
echo.

:: Instead of pause, we use a choice prompt or let it loop/wait safely
pause

:cleanup
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq RPS_Backend" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq RPS_Frontend" /T /F > nul 2>&1
echo Goodbye!