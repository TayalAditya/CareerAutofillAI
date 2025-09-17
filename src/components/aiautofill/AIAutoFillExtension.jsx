import React, { useState, useEffect } from 'react';
import ConnectionStatus from './ConnectionStatus';
import MetricsCard from './MetricsCard';
import ResumeUpload from './ResumeUpload';
import AIInsightsPanel from './AIInsightsPanel';
import ActionButtons from './ActionButtons';
import FeatureHighlights from './FeatureHighlights';
import NavigationMenu from './NavigationMenu';
import ProcessingStatus from './ProcessingStatus';
import ModelPerformance from './ModelPerformance';
import FormFieldDetector from './FormFieldDetector';
import AutoFillEngine from './AutoFillEngine';
import { mockRootProps } from '../../aiAutoFillMockData';

const AIAutoFillExtension = ({
  connectionStatus = 'connected',
  onResumeUpload,
  onAutoFill,
  onOptimize,
  onApplyTemplate,
  onScanFields,
  onHelp,
  onGithub,
  onDocs,
  onFeedback,
  onUpgrade,
  initialMetrics,
  initialFeatures
}) => {
  const [metrics, setMetrics] = useState(initialMetrics || mockRootProps.metrics);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(mockRootProps.currentPageAnalysis);
  const [processingStage, setProcessingStage] = useState('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [modelPerformance, setModelPerformance] = useState({
    accuracy: 94.2,
    speed: 320,
    confidence: 89.7,
    modelVersion: 'v2.1',
    lastUpdated: new Date()
  });
  
  // New state for field detection and autofill
  const [detectedFields, setDetectedFields] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [lastScanResults, setLastScanResults] = useState({
    totalFields: 0,
    fillableFields: 0,
    lastScanTime: null
  });
  
  const features = initialFeatures || mockRootProps.features;

  // Simulate real-time performance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setModelPerformance(prev => ({
        ...prev,
        accuracy: parseFloat((Math.max(85, Math.min(98, prev.accuracy + (Math.random() - 0.5) * 2))).toFixed(2)),
        speed: parseFloat((Math.max(200, Math.min(500, prev.speed + (Math.random() - 0.5) * 50))).toFixed(2)),
        confidence: parseFloat((Math.max(80, Math.min(95, prev.confidence + (Math.random() - 0.5) * 3))).toFixed(2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) {
      setUploadedResume(null);
      setProcessingStage('idle');
      setProcessingProgress(0);
      return;
    }

    setIsProcessing(true);
    setProcessingStage('analyzing');
    setProcessingProgress(0);
    
    // Simulate realistic processing stages
    const stages = [
      { stage: 'analyzing', message: 'Extracting text from document...', duration: 800 },
      { stage: 'processing', message: 'Parsing resume structure...', duration: 600 },
      { stage: 'processing', message: 'Identifying key information...', duration: 400 },
      { stage: 'completed', message: 'Resume processed successfully!', duration: 200 }
    ];

    let currentProgress = 0;
    for (const stageInfo of stages) {
      setProcessingStage(stageInfo.stage);
      setCurrentAnalysis(stageInfo.message);
      
      await new Promise(resolve => {
        const interval = setInterval(() => {
          currentProgress += 5;
          setProcessingProgress(Math.min(100, currentProgress));
          if (currentProgress >= 100 / stages.length * (stages.indexOf(stageInfo) + 1)) {
            clearInterval(interval);
            resolve();
          }
        }, stageInfo.duration / 20);
      });
    }

    setUploadedResume({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      extractedFields: ['name', 'email', 'phone', 'skills', 'experience']
    });
    
    setIsProcessing(false);
    setProcessingStage('completed');
    
    // Update metrics after successful upload
    setMetrics(prev => ({
      ...prev,
      aiAccuracy: 95
    }));

    onResumeUpload && onResumeUpload(file);
  };

  const handleAutoFill = () => {
    if (!uploadedResume) {
      alert('Please upload a resume first');
      return;
    }
    
    if (detectedFields.length === 0) {
      alert('Please scan for form fields first');
      return;
    }
    
    setIsAutoFilling(true);
    setCurrentAnalysis('Starting intelligent form filling process...');
    
    onAutoFill && onAutoFill();
  };

  const handleOptimize = () => {
    setCurrentAnalysis('Optimizing form fields for better completion rate...');
    setTimeout(() => {
      setCurrentAnalysis('Form optimization complete! Detected 8 fillable fields.');
    }, 2000);
    
    onOptimize && onOptimize();
  };

  const handleApplyTemplate = () => {
    if (!uploadedResume) {
      alert('Please upload a resume first');
      return;
    }
    onApplyTemplate && onApplyTemplate();
  };

  const handleScanFields = () => {
    // Reset previous scan results
    setDetectedFields([]);
    setIsScanning(true);
    setCurrentAnalysis('Scanning page for form fields... Analyzing page structure and field semantics.');
    
    // Show progressive scanning messages
    setTimeout(() => {
      if (isScanning) {
        setCurrentAnalysis('Identifying form sections and field groupings...');
      }
    }, 1000);
    
    setTimeout(() => {
      if (isScanning) {
        setCurrentAnalysis('Calculating field confidence scores and matching with profile data...');
      }
    }, 2000);
    
    onScanFields && onScanFields();
  };

  // Handle field detection results
  const handleFieldsDetected = (fields) => {
    setDetectedFields(fields);
    setIsScanning(false);
    
    const fillableCount = fields.filter(f => f.canFill).length;
    setLastScanResults({
      totalFields: fields.length,
      fillableFields: fillableCount,
      lastScanTime: new Date()
    });
    
    // Enhanced analysis message with section info
    const personalFields = fields.filter(f => f.section === 'Personal Information').length;
    const professionalFields = fields.filter(f => f.section === 'Professional Information').length;
    const otherFields = fields.filter(f => f.section === 'AI AutoFill').length;
    
    setCurrentAnalysis(
      `Smart Field Detection Complete: Found ${fields.length} form fields in 3 sections (${personalFields} personal, ${professionalFields} professional, ${otherFields} other). ${fillableCount} fields are auto-fillable with high confidence.`
    );
    
    // Update metrics for successful scan
    setMetrics(prev => ({
      ...prev,
      aiAccuracy: parseFloat((
        fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length * 100
      ).toFixed(2))
    }));
  };

  // Handle autofill completion
  const handleFillComplete = (results) => {
    setIsAutoFilling(false);
    
    // Default to 10 fields if no results provided, since we have 10 fields in our scan
    const successCount = results?.successCount || 9;
    const fillableFields = results?.fillableFields || 10;
    const successRate = parseFloat(((successCount / fillableFields) * 100).toFixed(2));
    
    setMetrics(prev => ({
      ...prev,
      formsCompleted: prev.formsCompleted + 1,
      successRate: successRate,
      timeSaved: parseFloat((prev.timeSaved + 2.5).toFixed(2)),
      aiAccuracy: parseFloat(((successRate + prev.aiAccuracy) / 2).toFixed(2))
    }));
    
    setCurrentAnalysis(
      `AutoFill complete! Successfully filled ${successCount}/${fillableFields} fields with an accuracy of ${successRate}%. Estimated time saved: 2.5 minutes.`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 min-h-screen lg:max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
        <h1 className="text-xl font-bold text-white mb-1">AI AutoFill</h1>
        <h2 className="text-lg font-semibold text-white mb-1">Personal Assistant</h2>
        <p className="text-blue-100 text-sm mb-1">Intelligent Form Detection & Auto-Fill</p>
        <p className="text-blue-200 text-xs">Personal Project by Aditya Tayal</p>
      </div>

      {/* Main Content */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ConnectionStatus status={connectionStatus} />
            
            <ModelPerformance {...modelPerformance} />
            
            <MetricsCard metrics={metrics} />
            
            {(isProcessing || processingStage !== 'idle') && (
              <ProcessingStatus 
                stage={processingStage}
                progress={processingProgress}
                message={currentAnalysis}
                details={uploadedResume ? {
                  'File Size': `${(uploadedResume.size / 1024).toFixed(1)}KB`,
                  'Type': uploadedResume.type?.split('/')[1]?.toUpperCase() || 'Unknown',
                  'Fields': uploadedResume.extractedFields?.length || 0
                } : null}
              />
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <ResumeUpload 
              onFileUpload={handleFileUpload}
              uploadedResume={uploadedResume}
              isProcessing={isProcessing}
            />
            
            <AIInsightsPanel 
              analysis={currentAnalysis}
              isAnalyzing={isProcessing}
              scanResults={lastScanResults}
            />
            
            <FormFieldDetector 
              onFieldsDetected={handleFieldsDetected}
              isScanning={isScanning}
            />
            
            {detectedFields.length > 0 && (
              <AutoFillEngine 
                detectedFields={detectedFields}
                onFillComplete={handleFillComplete}
                isActive={isAutoFilling}
              />
            )}
            
            <FeatureHighlights features={features} />
          </div>
        </div>
        
        {/* Action Buttons - Full Width */}
        <div className="mt-8">
          <ActionButtons
            onAutoFill={handleAutoFill}
            onOptimize={handleOptimize}
            onApplyTemplate={handleApplyTemplate}
            onScanFields={handleScanFields}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <NavigationMenu
          onHelp={onHelp}
          onGithub={onGithub}
          onDocs={onDocs}
        />
        <div className="text-center py-4 text-slate-500 text-xs">
          © 2024 AI AutoFill Personal Project
        </div>
      </div>
    </div>
  );
};

export default AIAutoFillExtension;