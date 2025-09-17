import React from 'react';
import { Brain, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';

const ProcessingStatus = ({ 
  stage = 'idle', 
  progress = 0, 
  message = '',
  details = null 
}) => {
  const stages = {
    idle: {
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      title: 'Ready'
    },
    analyzing: {
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      title: 'Analyzing Document'
    },
    processing: {
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      title: 'Processing Data'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      title: 'Completed'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      title: 'Error'
    }
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${currentStage.bgColor}`}>
          {stage === 'analyzing' || stage === 'processing' ? (
            <LoadingSpinner variant="ai" size="sm" />
          ) : (
            <Icon className={`w-5 h-5 ${currentStage.color}`} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-slate-100 font-medium">{currentStage.title}</h4>
          {message && (
            <p className="text-slate-400 text-sm">{message}</p>
          )}
        </div>
      </div>

      {(stage === 'analyzing' || stage === 'processing') && progress > 0 && (
        <ProgressBar 
          progress={progress} 
          variant="ai" 
          size="sm" 
          showPercentage={true}
          animated={true}
        />
      )}

      {details && (
        <div className="mt-3 text-xs text-slate-500">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;