import React from 'react';
import { CheckCheck, AlertCircle, Loader } from 'lucide-react';

const ConnectionStatus = ({ status = 'connected' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCheck,
          text: 'Connected to AI Engine',
          subtext: 'Backend server operational',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30'
        };
      case 'connecting':
        return {
          icon: Loader,
          text: 'Connecting to AI Engine',
          subtext: 'Establishing connection...',
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30'
        };
      case 'disconnected':
        return {
          icon: AlertCircle,
          text: 'Disconnected from AI Engine',
          subtext: 'Backend server unavailable',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Unknown Status',
          subtext: 'Please check connection',
          bgColor: 'bg-slate-700',
          textColor: 'text-slate-300',
          borderColor: 'border-slate-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-center space-x-3">
        <Icon 
          size={20} 
          className={`${config.textColor} ${status === 'connecting' ? 'animate-spin' : ''}`} 
        />
        <div>
          <p className={`${config.textColor} font-medium text-sm`}>
            {config.text}
          </p>
          <p className="text-slate-400 text-xs">
            {config.subtext}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;