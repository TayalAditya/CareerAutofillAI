import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  pulse = false,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    ai: 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 border-purple-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variants[variant]} 
        ${sizes[size]} 
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;