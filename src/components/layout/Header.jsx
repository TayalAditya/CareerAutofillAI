import React from 'react';
import { BrainCircuit, CircleCheck, AlertCircle, Loader2 } from 'lucide-react';
import AnimatedContainer from '../ui/AnimatedContainer';

const Header = ({ backendStatus }) => {
  const getStatusConfig = () => {
    switch (backendStatus) {
      case 'connected':
        return {
          icon: CircleCheck,
          text: 'AI Engine Connected',
          className: 'text-green-500 bg-green-50/50 border-green-200/50'
        };
      case 'checking':
        return {
          icon: Loader2,
          text: 'Connecting...',
          className: 'text-blue-500 bg-blue-50/50 border-blue-200/50 animate-spin'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Backend Disconnected',
          className: 'text-red-500 bg-red-50/50 border-red-200/50'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <AnimatedContainer animation="slideIn" delay={100}>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                <BrainCircuit size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Career AutoFill AI Agent</h1>
                <p className="text-sm text-gray-600">Multi-Agent Architecture with Fine-tuned LoRA</p>
              </div>
            </div>
          </AnimatedContainer>
          
          <AnimatedContainer animation="slideIn" delay={200}>
            <div className={`
              flex items-center space-x-2 px-4 py-2 rounded-full border backdrop-blur-xl
              ${statusConfig.className}
            `}>
              <StatusIcon size={16} className={backendStatus === 'checking' ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">{statusConfig.text}</span>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </header>
  );
};

export default Header;