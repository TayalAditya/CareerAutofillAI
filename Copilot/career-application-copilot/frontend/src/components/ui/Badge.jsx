import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  icon: Icon,
  onClick,
  ...props 
}) => {
  const baseClasses = `inline-flex items-center font-medium rounded-full transition-all duration-200 ${
    onClick ? 'cursor-pointer hover:shadow-md' : ''
  }`;
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
    glass: 'bg-white/20 backdrop-blur-sm text-gray-900 border border-white/30'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const Component = onClick ? 'button' : 'span';
  
  return (
    <Component className={classes} onClick={onClick} {...props}>
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className="mr-1" />}
      {children}
    </Component>
  );
};

export default Badge;