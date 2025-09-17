import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import ProgressSteps from './components/layout/ProgressSteps';
import ResumeUpload from './components/features/ResumeUpload';
import JobAnalysis from './components/features/JobAnalysis';
import ApplicationResults from './components/features/ApplicationResults';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Button from './components/ui/Button';
import AnimatedContainer from './components/ui/AnimatedContainer';
import { AlertCircle } from 'lucide-react';

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
      const response = await fetch(`${API_BASE}/ai/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          company_name: 'Target Company',
          role_title: 'Target Role'
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
      const response = await fetch(`${API_BASE}/ai/generate-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          company_name: 'Target Company',
          role_title: 'Target Role',
          session_id: 'demo-session'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate application package');
      }

      const result = await response.json();
      setApplicationPackage(result.application_package);
      setCurrentStep('result');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setUserProfile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setApplicationPackage(null);
    setError(null);
  };

  const handleDownload = () => {
    const content = `RESUME BULLETS:\n${applicationPackage.bullets?.join('\n• ') || ''}\n\nCOVER LETTER:\n${applicationPackage.cover_letter || ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application-package.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <ResumeUpload
            onFileUpload={handleResumeUpload}
            userProfile={userProfile}
            loading={loading}
            error={error}
          />
        );
      case 'jobInput':
        return (
          <div className="space-y-8">
            <JobAnalysis
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAnalyze={handleJobAnalysis}
              analysisResult={analysisResult}
              loading={loading}
              error={error}
            />
            {analysisResult && (
              <div className="text-center">
                <Button
                  onClick={generateApplicationPackage}
                  variant="primary"
                  size="lg"
                  loading={loading}
                >
                  Generate Application Package
                </Button>
              </div>
            )}
          </div>
        );
      case 'analysis':
        return (
          <div className="text-center py-20">
            <LoadingSpinner variant="ai" size="xl" text="Generating personalized application materials..." />
            <p className="mt-6 text-gray-600">This may take a few moments while our AI agents work their magic</p>
          </div>
        );
      case 'result':
        return (
          <ApplicationResults
            applicationPackage={applicationPackage}
            onRestart={handleRestart}
            onDownload={handleDownload}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10">
        <Header backendStatus={backendStatus} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressSteps currentStep={currentStep} />
          
          {error && (
            <AnimatedContainer animation="slideUp" delay={100}>
              <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              </div>
            </AnimatedContainer>
          )}
          
          <div className="max-w-5xl mx-auto">
            {renderCurrentStep()}
          </div>
        </main>
        
        <footer className="bg-white/10 backdrop-blur-xl border-t border-white/20 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-2">
              <p className="text-gray-700 font-medium">Career AutoFill AI Agent</p>
              <p className="text-gray-600 text-sm">
                Developed by Aditya Tayal | IIT Mandi CSE | Multi-Agent Architecture with Fine-tuned LoRA Model
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mt-4">
                <span>LoRA Fine-tuning: Active</span>
                <span>•</span>
                <span>Evaluation Metrics: Comprehensive</span>
                <span>•</span>
                <span>Multi-Agent: Planner + Executor + Tracker</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;