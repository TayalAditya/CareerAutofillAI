@echo off
REM Start script for Career AutoFill AI Agent Backend (Windows)

echo 🚀 Starting Career AutoFill AI Agent Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📋 Installing requirements...
pip install -r requirements.txt

REM Download spacy model if not exists
echo 🧠 Downloading spaCy model...
python -m spacy download en_core_web_sm

REM Start the backend server
echo 🌟 Starting FastAPI server...
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo ✅ Backend started at http://localhost:8000
pause
