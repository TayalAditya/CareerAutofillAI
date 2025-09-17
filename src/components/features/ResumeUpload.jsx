import React, { useState, useCallback } from 'react';
import { Upload, FileUp, CircleCheck, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import AnimatedContainer from '../ui/AnimatedContainer';

const ResumeUpload = ({ onFileUpload, userProfile, loading, error }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.type)) {
      setUploadProgress(0);
      onFileUpload && onFileUpload(file);
    } else {
      alert('Please upload a PDF, DOC, or DOCX file.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (userProfile) {
    return (
      <AnimatedContainer animation="scaleIn" delay={200}>
        <Card variant="success" className="border-green-500/30 bg-green-50/10">
          <Card.Content className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CircleCheck size={24} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Resume Processed Successfully</h3>
                  <p className="text-gray-600 mt-1">Profile extracted and ready for analysis</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4">
                <h4 className="font-medium text-gray-900">Name</h4>
                <p className="text-gray-700 mt-1">{userProfile.name || 'Not detected'}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4">
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-gray-700 mt-1">{userProfile.email || 'Not detected'}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4">
                <h4 className="font-medium text-gray-900">Skills</h4>
                <p className="text-gray-700 mt-1">{userProfile.skills?.length || 0} detected</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer animation="fadeIn">
      <Card variant="glass" className="overflow-hidden">
        <Card.Header>
          <div className="text-center">
            <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Upload size={32} className="text-blue-500" />
            </div>
            <Card.Title className="gradient-text">Upload Your Resume</Card.Title>
            <p className="text-gray-600 mt-2">Upload your resume to extract profile information using AI</p>
          </div>
        </Card.Header>
        
        <Card.Content>
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner variant="upload" size="xl" text="Processing your resume..." />
              <div className="mt-6 max-w-xs mx-auto">
                <div className="bg-gray-200/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Extracting information...</p>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50/20 scale-105' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              <div className="animate-bounce-gentle">
                <FileUp size={48} className="text-gray-400 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drag and drop your resume here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse files
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, and DOCX files up to 10MB
              </p>
              
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <Button 
                variant="primary" 
                className="mt-6"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('resume-upload').click();
                }}
              >
                Choose File
              </Button>
            </div>
          )}
          
          {error && (
            <AnimatedContainer animation="slideUp" delay={100}>
              <div className="mt-4 p-4 bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-xl flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </AnimatedContainer>
          )}
        </Card.Content>
      </Card>
    </AnimatedContainer>
  );
};

export default ResumeUpload;