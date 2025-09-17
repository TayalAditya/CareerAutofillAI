import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Server } from 'lucide-react';
import apiService from '../../services/api';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [backendInfo, setBackendInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const testConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const result = await apiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setBackendInfo(result.data);
      } else {
        setConnectionStatus('failed');
        setError(result.error);
      }
    } catch (err) {
      setConnectionStatus('failed');
      setError(err.message);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await testConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Backend Connected';
      case 'failed':
        return 'Backend Disconnected';
      case 'checking':
      default:
        return 'Checking Connection...';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'checking':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Server className="w-6 h-6 text-gray-600" />
          <div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-900">
                {getStatusText()}
              </span>
            </div>
            
            {connectionStatus === 'connected' && backendInfo && (
              <div className="mt-1 text-sm text-gray-600">
                <p>API: {backendInfo.message || 'Career AutoFill Assistant API'}</p>
                <p>Endpoint: http://localhost:8000</p>
              </div>
            )}
            
            {connectionStatus === 'failed' && (
              <div className="mt-1 text-sm text-red-600">
                <p>Error: {error}</p>
                <p className="text-xs mt-1">
                  Make sure the backend server is running on port 8000
                </p>
              </div>
            )}
          </div>
        </div>
        
        {connectionStatus === 'failed' && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
        )}
      </div>
      
      {/* Quick Actions */}
      {connectionStatus === 'connected' && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-700 font-medium mb-2">Quick API Tests:</p>
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                const result = await apiService.getExtensionProfile();
                console.log('Extension Profile Test:', result);
                alert(result.success ? 'Extension profile test successful!' : `Test failed: ${result.error}`);
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Test Profile API
            </button>
            
            <button
              onClick={async () => {
                const result = await apiService.trackEvent('frontend_test', { timestamp: Date.now() });
                console.log('Analytics Test:', result);
                alert('Analytics test sent (check console)');
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Test Analytics
            </button>
          </div>
        </div>
      )}
      
      {/* Backend Setup Instructions */}
      {connectionStatus === 'failed' && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-700 font-medium mb-2">To start the backend:</p>
          <div className="text-xs text-red-600 space-y-1">
            <p>1. cd Copilot/career-application-copilot/backend</p>
            <p>2. pip install fastapi uvicorn python-multipart</p>
            <p>3. python -m uvicorn main:app --reload --port 8000</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;