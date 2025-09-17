import React from 'react';
import { BrainCircuit, Upload, BarChart3 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  text = '', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    default: { icon: BrainCircuit, color: 'text-blue-500' },
    ai: { icon: BrainCircuit, color: 'text-purple-500' },
    upload: { icon: Upload, color: 'text-green-500' },
    processing: { icon: BarChart3, color: 'text-yellow-500' }
  };

  const { icon: Icon, color } = variants[variant];

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <Icon className={`${sizes[size]} ${color} animate-spin`} />
      {text && (
        <span className="text-sm text-gray-600 animate-pulse font-medium">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;