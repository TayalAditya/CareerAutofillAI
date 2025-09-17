import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'responsive' 
}) => {
  const maxWidths = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  const paddings = {
    'none': '',
    'sm': 'px-4',
    'md': 'px-6',
    'lg': 'px-8',
    'responsive': 'px-4 lg:px-6 xl:px-8'
  };

  return (
    <div className={`
      w-full mx-auto
      ${maxWidths[maxWidth]} 
      ${paddings[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;