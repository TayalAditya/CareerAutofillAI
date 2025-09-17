import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { formatFileSize } from '../../aiAutoFillMockData';

const ResumeUpload = ({ onFileUpload, uploadedResume, isProcessing }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.type)) {
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

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileUpload && onFileUpload(null);
  };

  if (uploadedResume) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-slate-100 font-medium">{uploadedResume.name}</p>
              <p className="text-slate-400 text-sm">
                {formatFileSize(uploadedResume.size)} • Uploaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {isProcessing && (
          <div className="mt-4 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-slate-400 text-sm">Processing resume...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-slate-100 font-semibold text-lg mb-2">Upload Resume</h3>
        <p className="text-slate-400 text-sm">Upload your resume to enable AI-powered form filling</p>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-500/10' 
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-300 font-medium mb-2">
          Drag and drop your resume here
        </p>
        <p className="text-slate-400 text-sm mb-4">
          Supported formats: PDF, DOC, DOCX
        </p>
        <button
          onClick={handleBrowseClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ResumeUpload;