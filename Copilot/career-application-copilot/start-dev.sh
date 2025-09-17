#!/bin/bash

# Career AutoFill Development Startup Script
echo "🚀 Starting Career AutoFill Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Python
if command_exists python3; then
    echo -e "${GREEN}✅ Python3 found${NC}"
else
    echo -e "${RED}❌ Python3 not found. Please install Python 3.7+${NC}"
    exit 1
fi

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✅ Node.js found${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 14+${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✅ npm found${NC}"
else
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

# Check if ports are available
if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Backend might already be running.${NC}"
fi

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Frontend might already be running.${NC}"
fi

echo -e "${BLUE}Setting up backend...${NC}"

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install fastapi uvicorn python-multipart spacy fuzzywuzzy PyPDF2 python-docx

# Download spaCy model if not exists
echo -e "${BLUE}Checking spaCy model...${NC}"
python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null || {
    echo -e "${YELLOW}Downloading spaCy English model...${NC}"
    python -m spacy download en_core_web_sm
}

# Start backend in background
echo -e "${GREEN}🚀 Starting backend server on http://localhost:8000${NC}"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Navigate to frontend directory
cd ../frontend

echo -e "${BLUE}Setting up frontend...${NC}"

# Install Node.js dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing Node.js dependencies...${NC}"
    npm install
fi

# Start frontend
echo -e "${GREEN}🚀 Starting frontend server on http://localhost:3000${NC}"
npm start &
FRONTEND_PID=$!

# Wait for user input to stop servers
echo -e "${GREEN}"
echo "=========================================="
echo "🎉 Development environment is ready!"
echo "=========================================="
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "=========================================="
echo -e "${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes to finish
wait