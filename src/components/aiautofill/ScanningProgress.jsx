import React from 'react';

const ScanningProgress = ({ progress, status, message }) => {
  if (status !== 'scanning') return null;

  return (
    <div className="mb-4">
      <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{message || 'Analyzing form structure...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default ScanningProgress;