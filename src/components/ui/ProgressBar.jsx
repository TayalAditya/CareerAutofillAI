import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  variant = 'default', 
  size = 'md', 
  showPercentage = false,
  animated = true,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-blue-500 to-purple-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-500',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500'
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-gray-200/30 backdrop-blur-xl rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${variants[variant]} ${sizes[size]} rounded-full transition-all duration-700 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Progress</span>
          <span className="font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;