import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const baseClasses = 'w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' 
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/50'
    : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/50';
  
  const classes = `${baseClasses} ${stateClasses} ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon 
            size={20} 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              focused ? 'text-blue-500' : 'text-gray-400'
            }`} 
          />
        )}
        
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${classes} ${Icon ? 'pl-11' : ''} ${type === 'password' ? 'pr-11' : ''}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {success && (
          <Check size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
        )}
        
        {error && (
          <AlertCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      )}
      
      {success && (
        <p className="text-sm text-green-600 flex items-center space-x-1">
          <Check size={14} />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
};

export default Input;