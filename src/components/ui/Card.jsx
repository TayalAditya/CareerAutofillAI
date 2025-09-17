import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  animated = true,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl',
    glass: 'bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl hover:bg-white/10',
    solid: 'bg-white border-gray-200 shadow-md hover:shadow-lg',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border-white/20 shadow-xl',
    glow: 'bg-white/10 backdrop-blur-xl border-blue-500/30 shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl'
  };
  
  const animationClasses = animated ? 'hover:scale-105 transform' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${animationClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;