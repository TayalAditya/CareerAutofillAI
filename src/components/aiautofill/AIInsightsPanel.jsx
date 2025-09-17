import React, { useEffect, useState } from 'react';
import { BrainCircuit, Loader, CheckCircle, AlertCircle, Cpu, Target, Zap } from 'lucide-react';

const AIInsightsPanel = ({ analysis, isAnalyzing = false, modelPerformance = null, scanResults = null }) => {
  const [agentStatus, setAgentStatus] = useState('idle'); // idle, thinking, success, error
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // Simulate AI agent processing when analysis changes
  useEffect(() => {
    if (isAnalyzing) {
      setAgentStatus('thinking');
      return;
    }
    
    if (analysis) {
      setAgentStatus('success');
      // Parse analysis into structured suggestions
      const suggestions = typeof analysis === 'string' 
        ? [{ type: 'general', text: analysis }]
        : generateSuggestions(analysis);
      setAiSuggestions(suggestions);
    } else {
      setAgentStatus('idle');
    }
  }, [analysis, isAnalyzing]);
  
  // Generate structured suggestions from analysis data
  const generateSuggestions = (analysisData) => {
    // If we have scan results, provide intelligent insights based on those
    if (scanResults && scanResults.totalFields > 0) {
      return [
        { 
          type: 'scan', 
          text: `Detected ${scanResults.totalFields} form fields (${scanResults.fillableFields} auto-fillable).` 
        },
        { 
          type: 'analysis', 
          text: 'Form structure analysis complete. Personal and professional information fields identified.' 
        },
        { 
          type: 'recommendation', 
          text: 'Ready for AI-powered auto-fill. All required fields can be filled with your resume data.' 
        }
      ];
    }
    
    // Default suggestions if no scan results
    return [
      { type: 'keyword', text: 'Add more keywords matching the job description' },
      { type: 'format', text: 'Consider restructuring your work history to highlight relevant experience' },
      { type: 'skill', text: 'Emphasize your technical skills that align with the job requirements' }
    ];
  };
  
  // Format performance numbers
  const formatMetric = (value, type) => {
    if (type === 'percentage') {
      return `${Number(value).toFixed(2)}%`;
    } else if (type === 'speed') {
      return `${Math.round(value)}ms`;
    }
    return value.toString();
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}`;
  };
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <BrainCircuit size={20} className="text-purple-400" />
          </div>
          <h3 className="text-slate-100 font-semibold text-lg">
            AI Insights & Recommendations
          </h3>
        </div>
        {/* Agent status indicator */}
        <div className="flex items-center space-x-2">
          {agentStatus === 'thinking' && (
            <Loader size={16} className="text-blue-400 animate-spin" />
          )}
          {agentStatus === 'success' && (
            <CheckCircle size={16} className="text-green-400" />
          )}
          {agentStatus === 'error' && (
            <AlertCircle size={16} className="text-red-400" />
          )}
          <span className="text-xs text-slate-400 capitalize">{agentStatus}</span>
        </div>
      </div>
      
      {/* Display model performance if available */}
      {modelPerformance && (
        <div className="mb-4 bg-slate-900/70 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Model Performance</span>
            <span className="text-xs font-semibold text-emerald-400">{modelPerformance.modelVersion}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div className="flex items-center space-x-1">
              <Target size={12} className="text-green-400" />
              <span className="text-xs text-slate-300 font-medium">{formatMetric(modelPerformance.accuracy, 'percentage')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-xs text-slate-300 font-medium">{formatMetric(modelPerformance.speed, 'speed')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Cpu size={12} className="text-blue-400" />
              <span className="text-xs text-slate-300 font-medium">{formatMetric(modelPerformance.confidence, 'percentage')}</span>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 mt-1">
            Last updated: {formatDate(modelPerformance.lastUpdated)}
          </div>
        </div>
      )}
      
      {/* Scanned Results Section */}
      <div className="mb-4 bg-slate-900/70 rounded-lg p-3 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Scan Results</span>
          <span className="text-xs font-semibold text-blue-400">
            {scanResults?.lastScanTime ? 'Latest Scan' : 'No Scan Yet'}
          </span>
        </div>
        
        <div className="text-xs text-slate-300 mb-2">
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span>Total Fields Detected:</span>
            <span className="font-medium text-white">{scanResults?.totalFields || 0}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span>Auto-fillable Fields:</span>
            <span className="font-medium text-white">{scanResults?.fillableFields || 0}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span>Recognition Confidence:</span>
            <span className={`font-medium ${
              !scanResults ? 'text-slate-400' :
              scanResults.fillableFields > scanResults.totalFields * 0.7 ? 'text-green-400' :
              scanResults.fillableFields > scanResults.totalFields * 0.4 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {!scanResults ? 'N/A' :
               scanResults.fillableFields > scanResults.totalFields * 0.7 ? 'High' :
               scanResults.fillableFields > scanResults.totalFields * 0.4 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span>Last Scan:</span>
            <span className="font-medium text-white">
              {scanResults?.lastScanTime ? 
                scanResults.lastScanTime.toLocaleTimeString() : 
                'Never'
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900/50 rounded-lg p-4">
        {isAnalyzing ? (
          <div className="flex items-center space-x-3">
            <Loader size={16} className="text-blue-400 animate-spin" />
            <span className="text-slate-300 text-sm">
              AI agents analyzing current page for optimization opportunities...
            </span>
          </div>
        ) : aiSuggestions.length > 0 ? (
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-2 border-l-2 border-purple-500 bg-slate-800/50">
                <p className="text-slate-300 text-sm">{suggestion.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-300 text-sm">
            AI agents ready to analyze your application and provide insights.
          </p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;