import React, { useState, useEffect } from 'react';
import { Upload, FileText, Brain, Target, BarChart3, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:8000';

const App = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [userProfile, setUserProfile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [applicationPackage, setApplicationPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Check backend connection on load
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const handleResumeUpload = async (file) => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const result = await response.json();
      setUserProfile(result.profile);
      setCurrentStep('jobInput');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          user_profile: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setCurrentStep('analysis');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateApplicationPackage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/generate-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysisResult,
          user_profile: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate application package');
      }

      const result = await response.json();
      setApplicationPackage(result);
      setCurrentStep('result');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const UploadStep = () => (
    <div className="step-container">
      <div className="step-header">
        <Upload className="step-icon" />
        <h2>Upload Your Resume</h2>
        <p>Upload your resume and let our AI agent extract and analyze your profile</p>
      </div>

      <div className="upload-area">
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx"
          onChange={(e) => e.target.files[0] && handleResumeUpload(e.target.files[0])}
          className="file-input"
        />
        <label htmlFor="resume-upload" className="upload-label">
          <FileText size={48} />
          <span>Click to upload or drag and drop</span>
          <small>PDF, DOC, or DOCX files only</small>
        </label>
      </div>

      {userProfile && (
        <div className="profile-preview">
          <h3>Profile Extracted ✅</h3>
          <div className="profile-details">
            <p><strong>Name:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Skills:</strong> {userProfile.skills?.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );

  const JobInputStep = () => (
    <div className="step-container">
      <div className="step-header">
        <Brain className="step-icon" />
        <h2>Job Description Analysis</h2>
        <p>Paste the job description for AI-powered analysis and matching</p>
      </div>

      <div className="input-area">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={10}
          className="job-textarea"
        />
        <button
          onClick={handleJobAnalysis}
          disabled={!jobDescription.trim() || loading}
          className="analyze-btn"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Target />}
          Analyze Job Description
        </button>
      </div>
    </div>
  );

  const AnalysisStep = () => (
    <div className="step-container">
      <div className="step-header">
        <BarChart3 className="step-icon" />
        <h2>AI Analysis Results</h2>
        <p>Our fine-tuned model has analyzed the job requirements</p>
      </div>

      {analysisResult && (
        <div className="analysis-results">
          <div className="match-score">
            <h3>Match Score</h3>
            <div className="score-circle">
              {Math.round(analysisResult.match_score * 100)}%
            </div>
          </div>

          <div className="skills-section">
            <h3>Skills Analysis</h3>
            <div className="skills-grid">
              <div className="skill-category">
                <h4>✅ Matching Skills</h4>
                <ul>
                  {analysisResult.matching_skills?.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className="skill-category">
                <h4>❌ Missing Skills</h4>
                <ul>
                  {analysisResult.missing_skills?.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={generateApplicationPackage}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Download />}
            Generate Application Package
          </button>
        </div>
      )}
    </div>
  );

  const ResultStep = () => (
    <div className="step-container">
      <div className="step-header">
        <CheckCircle className="step-icon success" />
        <h2>Application Package Ready</h2>
        <p>Your personalized application materials have been generated</p>
      </div>

      {applicationPackage && (
        <div className="results-container">
          <div className="result-section">
            <h3>📝 Tailored Resume Bullets</h3>
            <div className="bullets-list">
              {applicationPackage.bullets?.map((bullet, i) => (
                <div key={i} className="bullet-item">
                  • {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h3>💼 Cover Letter</h3>
            <div className="cover-letter">
              {applicationPackage.cover_letter}
            </div>
          </div>

          <div className="result-section">
            <h3>📊 Evaluation Metrics</h3>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">Relevance Score</span>
                <span className="metric-value">{applicationPackage.evaluation?.relevance_score}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">ATS Compatibility</span>
                <span className="metric-value">{applicationPackage.evaluation?.ats_score}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Readability</span>
                <span className="metric-value">{applicationPackage.evaluation?.readability_score}%</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={() => setCurrentStep('upload')} className="restart-btn">
              Start New Application
            </button>
            <button className="download-btn">
              Download Package
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Target className="logo-icon" />
            <h1>Career AutoFill AI Agent</h1>
          </div>
          <div className="status-indicator">
            {backendStatus === 'connected' && (
              <div className="status connected">
                <CheckCircle size={16} />
                AI Engine Connected
              </div>
            )}
            {backendStatus === 'error' && (
              <div className="status error">
                <AlertCircle size={16} />
                Backend Disconnected
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="progress-bar">
        <div className={`progress-step ${currentStep === 'upload' ? 'active' : currentStep !== 'upload' ? 'completed' : ''}`}>
          <span>1. Upload Resume</span>
        </div>
        <div className={`progress-step ${currentStep === 'jobInput' ? 'active' : currentStep === 'analysis' || currentStep === 'result' ? 'completed' : ''}`}>
          <span>2. Job Analysis</span>
        </div>
        <div className={`progress-step ${currentStep === 'analysis' ? 'active' : currentStep === 'result' ? 'completed' : ''}`}>
          <span>3. AI Analysis</span>
        </div>
        <div className={`progress-step ${currentStep === 'result' ? 'active' : ''}`}>
          <span>4. Results</span>
        </div>
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {currentStep === 'upload' && <UploadStep />}
        {currentStep === 'jobInput' && <JobInputStep />}
        {currentStep === 'analysis' && <AnalysisStep />}
        {currentStep === 'result' && <ResultStep />}
      </main>

      <footer className="app-footer">
        <p>Career AutoFill AI Agent - Aditya Tayal, IIT Mandi CSE</p>
        <p>Multi-Agent Architecture with Fine-tuned LoRA Model</p>
      </footer>
    </div>
  );
};

export default App;
