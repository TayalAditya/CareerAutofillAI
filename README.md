# Career Autofill AI

**Name:** Aditya Tayal  
**University:** Indian Institute of Technology Mandi  
**Department:** Computer Science Engineering 3rd Year  
**Email:** b23243@students.iitmandi.ac.in  

An AI-powered agent that automates job application form filling by reasoning, planning, and executing tasks using fine-tuned models.

## Overview

This project implements an AI agent that selects a manual task (job application form filling) from daily life/university work and automates it. The agent uses at least one fine-tuned model (LoRA-based) for specialized task performance, with evaluation metrics to measure quality and reliability.

## Core Features (Mandatory)

- **Manual Task Automation**: Automates job application form filling - a common manual task in career applications.
- **AI Agent Architecture**: 
  - Reason: Analyzes job descriptions and user profiles
  - Plan: Creates step-by-step filling strategies
  - Execute: Fills forms automatically
- **Fine-tuned Model Integration**:
  - Uses LoRA (Low-Rank Adaptation) for parameter-efficient fine-tuning
  - Specialized for form field detection and content generation
  - Chosen for: Task specialization (better accuracy on job-related content), improved reliability (reduced hallucinations), and adapted style (professional application language)
- **Evaluation Metrics**:
  - Accuracy: Field detection precision/recall
  - Completeness: Percentage of fields filled correctly
  - Quality: Content relevance and professionalism scores
  - Reliability: Success rate across different form types

## Optional Features (Bonus Points)

- **Multi-agent Collaboration**: Planner + Executor agents working together
- **External Integrations**: 
  - RAG (Retrieval-Augmented Generation) for context-aware responses
  - MCP (Model Context Protocol) for tool integration
  - Custom browser extension tools
- **User Interface**: 
  - Web dashboard (React/Vite)
  - Browser extension for seamless form filling

## Notes

LLMs were used during development for code generation and architecture design. All interaction logs are included in the deliverables.

## Deliverables

- **Source Code**: Complete prototype in this repository
- **Architecture Document**: See `ARCHITECTURE.md`
- **Data Science Report**: See `DATA_SCIENCE_REPORT.md`
- **Interaction Logs**: See `INTERACTION_LOGS.md`
- **Demo Video**: [Watch Demo](https://drive.google.com/file/d/1W3HdBg-nhgwgUqAJKX-SNZ1wAER7SXW0/view?usp=sharing).
- **Project Report**: [View Here](https://drive.google.com/file/d/1EOH4BWjM0I6FiQQceSq6S59yRyvFfZlB/view?usp=sharing).

## Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd Copilot/career-application-copilot
pip install -r requirements.txt
python src/main.py --interactive
```

### Browser Extension
1. Load `Copilot/career-application-copilot/browser-extension` as unpacked extension
2. Follow `INSTALLATION_GUIDE.md` for setup

## Usage

1. Upload your resume and profile data
2. Navigate to a job application form
3. Click the extension button to auto-fill
4. Review and submit

## Architecture

- **Frontend**: React + Vite for modern web UI
- **Backend**: Python FastAPI for AI processing
- **Models**: Fine-tuned LLM with LoRA for specialized tasks
- **Extension**: Chrome extension for browser integration
