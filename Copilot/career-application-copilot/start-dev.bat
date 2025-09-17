@echo off
REM Career AutoFill Development Startup Script for Windows

echo 🚀 Starting Career AutoFill Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.7+
    pause
    exit /b 1
)
echo ✅ Python found

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 14+
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)
echo ✅ npm found

echo Setting up backend...

REM Navigate to backend directory
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install fastapi uvicorn python-multipart spacy fuzzywuzzy PyPDF2 python-docx

REM Download spaCy model
echo Checking spaCy model...
python -c "import spacy; spacy.load('en_core_web_sm')" 2>nul || (
    echo Downloading spaCy English model...
    python -m spacy download en_core_web_sm
)

REM Start backend server
echo 🚀 Starting backend server on http://localhost:8000
start "Backend Server" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Navigate to frontend directory
cd ..\frontend

echo Setting up frontend...

REM Install Node.js dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
)

REM Start frontend server
echo 🚀 Starting frontend server on http://localhost:3000
start "Frontend Server" cmd /k "npm start"

echo.
echo ==========================================
echo 🎉 Development environment is ready!
echo ==========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo ==========================================
echo.
echo Press any key to exit...
pause >nul