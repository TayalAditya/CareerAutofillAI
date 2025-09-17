import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'backdrop-blur-xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white/10 border-white/20',
    glass: 'bg-white/5 border-white/10',
    solid: 'bg-white border-gray-200',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 border-white/20',
    success: 'bg-green-50/50 border-green-200/50',
    warning: 'bg-yellow-50/50 border-yellow-200/50',
    error: 'bg-red-50/50 border-red-200/50'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverEffect = hover ? 'hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverEffect} rounded-2xl ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;