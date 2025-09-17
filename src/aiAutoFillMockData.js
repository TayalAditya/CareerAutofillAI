// Mock data for the AI AutoFill extension interface

// Status types for various components
export const ConnectionStatus = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting'
};

export const ProcessingStatus = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export const FileType = {
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx'
};

// String formatters
export const formatPercentage = (value) => {
  return `${value}%`;
};

export const formatTime = (hours) => {
  if (hours === 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
};

export const formatCount = (count) => {
  return count.toLocaleString();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Mock data for the AI AutoFill personal project
export const mockRootProps = {
  connectionStatus: "connected",
  metrics: {
    formsCompleted: 0,
    successRate: 0,
    timeSaved: 0,
    aiAccuracy: 0
  },
  isProcessing: false,
  uploadedResume: null,
  currentPageAnalysis: "Analyzing DOM structure and form elements...",
  features: [
    {
      id: "ml-detection",
      title: "Neural Form Field Detection",
      icon: "CHECK",
      enabled: true
    },
    {
      id: "nlp-processing",
      title: "NLP Document Processing", 
      icon: "LIGHTNING",
      enabled: true
    },
    {
      id: "context-mapping",
      title: "Intelligent Context Mapping",
      icon: "TARGET", 
      enabled: true
    },
    {
      id: "performance-analytics",
      title: "Real-time Performance Metrics",
      icon: "CHART",
      enabled: true
    }
  ]
};