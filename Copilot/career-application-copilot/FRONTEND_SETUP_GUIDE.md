# 🚀 Career AutoFill Frontend Setup Guide

## Quick Start

### 1. **Start the Backend Server**
```bash
# Navigate to backend directory
cd Copilot/career-application-copilot/backend

# Install Python dependencies (if not already done)
pip install fastapi uvicorn python-multipart spacy fuzzywuzzy PyPDF2 python-docx

# Download spaCy model
python -m spacy download en_core_web_sm

# Start the backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** `http://localhost:8000`

### 2. **Start the Frontend**
```bash
# Navigate to frontend directory
cd Copilot/career-application-copilot/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend will be available at:** `http://localhost:3000`

## 🔗 API Integration

### Backend API Endpoints Available:

#### **Core Endpoints:**
- `GET /` - Health check
- `POST /upload-resume` - Upload and parse resume
- `GET /profile/{session_id}` - Get user profile
- `POST /autofill` - Get auto-fill suggestions

#### **AI-Powered Endpoints:**
- `POST /ai/analyze-job` - Analyze job description with AI
- `POST /ai/generate-application` - Generate application package
- `GET /ai/profile/{session_id}` - Get AI-enhanced profile

#### **Extension Endpoints:**
- `POST /extension/profile` - Get profile for browser extension
- `POST /api/analytics/events` - Track analytics events

### Frontend API Service

I've created `src/services/api.js` with all the necessary API calls. Here's how to use it:

```javascript
import apiService from './services/api';

// Test backend connection
const connectionTest = await apiService.testConnection();
console.log(connectionTest);

// Upload resume
const uploadResult = await apiService.uploadResume(file);
if (uploadResult.success) {
  console.log('Resume uploaded:', uploadResult.data);
}

// Analyze job description
const analysis = await apiService.analyzeJob(jobDescription, companyName);
if (analysis.success) {
  console.log('Job analysis:', analysis.data);
}
```

## 🔧 Connecting Buttons to Backend

### Example: Update a Component to Use API

Let's update the `JobDescriptionParser` component:

```javascript
// In src/components/parser/JobDescriptionParser.jsx
import React, { useState } from 'react';
import apiService from '../../services/api';
import { useAppContext } from '../../App.CareerCopilot';

const JobDescriptionParser = ({ onParseComplete }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { addNotification } = useAppContext();

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter a job description'
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call backend API
      const result = await apiService.analyzeJob(jobDescription);
      
      if (result.success) {
        setAnalysis(result.data);
        onParseComplete(result.data);
        addNotification({
          type: 'success',
          message: 'Job description analyzed successfully!'
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Analysis failed: ${error.message}`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full h-40 p-4 border rounded-lg"
      />
      
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Job Description'}
      </button>
      
      {analysis && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Analysis Results:</h3>
          <p>Match Score: {analysis.match_score}%</p>
          <p>Matching Skills: {analysis.matching_skills.join(', ')}</p>
          <p>Missing Skills: {analysis.missing_skills.join(', ')}</p>
        </div>
      )}
    </div>
  );
};
```

## 🎯 Key Components to Update

### 1. **Profile Manager** (`src/components/profile/ProfileManager.jsx`)
```javascript
// Add resume upload functionality
const handleResumeUpload = async (file) => {
  const result = await apiService.uploadResume(file);
  if (result.success) {
    onUpdateProfile(result.data.profile);
  }
};
```

### 2. **Resume Tailor** (`src/components/resume/ResumeTailor.jsx`)
```javascript
// Generate tailored resume
const handleTailorResume = async () => {
  const result = await apiService.generateApplicationPackage(
    jobData.description, 
    jobData.company, 
    jobData.title, 
    apiService.getSessionId()
  );
  // Handle result...
};
```

### 3. **Cover Letter Generator** (`src/components/coverLetter/CoverLetterGenerator.jsx`)
```javascript
// Generate cover letter using AI
const handleGenerateCoverLetter = async () => {
  const result = await apiService.generateApplicationPackage(
    jobData.description, 
    jobData.company, 
    jobData.title, 
    apiService.getSessionId()
  );
  // Extract cover letter from result...
};
```

## 🔍 Testing the Integration

### 1. **Test Backend Connection**
Add this to any component to test:

```javascript
import { useEffect } from 'react';
import apiService from '../services/api';

useEffect(() => {
  const testBackend = async () => {
    const result = await apiService.testConnection();
    console.log('Backend test:', result);
  };
  testBackend();
}, []);
```

### 2. **Check Network Tab**
- Open browser DevTools → Network tab
- Perform actions in the frontend
- Verify API calls are being made to `http://localhost:8000`

### 3. **Check Backend Logs**
- Backend terminal should show incoming requests
- Look for `🚀 API Request:` logs in browser console

## 🛠️ Troubleshooting

### Common Issues:

#### **1. CORS Errors**
- Backend already configured for CORS
- If issues persist, check browser console for specific CORS errors

#### **2. Backend Not Running**
```bash
# Check if backend is running
curl http://localhost:8000

# Should return: {"message": "Career AutoFill Assistant API is running!"}
```

#### **3. Frontend Can't Connect**
- Verify `REACT_APP_API_URL` in `.env` file (optional)
- Default is `http://localhost:8000`
- Check if ports 3000 and 8000 are available

#### **4. Missing Dependencies**
```bash
# Backend dependencies
pip install fastapi uvicorn python-multipart spacy fuzzywuzzy PyPDF2 python-docx

# Frontend dependencies
npm install axios
```

## 🚀 Next Steps

1. **Start both servers** (backend on 8000, frontend on 3000)
2. **Test the connection** using the API service
3. **Update components** to use real API calls instead of mock data
4. **Add error handling** and loading states
5. **Test with real resume uploads** and job descriptions

## 📁 File Structure After Setup

```
frontend/
├── src/
│   ├── services/
│   │   └── api.js          # ✅ API service (created)
│   ├── components/
│   │   ├── profile/        # Update to use API
│   │   ├── parser/         # Update to use API  
│   │   ├── resume/         # Update to use API
│   │   └── coverLetter/    # Update to use API
│   └── App.CareerCopilot.jsx
├── package.json
└── ...

backend/
├── main.py                 # ✅ API endpoints ready
└── ...
```

The API service is now ready! Update your components to replace mock data with real API calls using the patterns shown above.