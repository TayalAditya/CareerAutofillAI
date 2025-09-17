#!/bin/bash
# Start script for Career AutoFill AI Agent Backend

echo "🚀 Starting Career AutoFill AI Agent Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📋 Installing requirements..."
pip install -r requirements.txt

# Download spacy model if not exists
echo "🧠 Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Start the backend server
echo "🌟 Starting FastAPI server..."
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "✅ Backend started at http://localhost:8000"
