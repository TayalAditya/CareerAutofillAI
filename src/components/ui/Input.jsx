import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  ...props 
}) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;