import React from 'react';
import { Target, Zap, FileText, Search } from 'lucide-react';

const ActionButtons = ({ 
  onAutoFill, 
  onOptimize, 
  onApplyTemplate, 
  onScanFields,
  disabled = false 
}) => {
  const buttons = [
    {
      id: 'autofill',
      label: 'Smart AutoFill',
      icon: Target,
      onClick: onAutoFill,
      className: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    {
      id: 'optimize',
      label: 'AI Optimize',
      icon: Zap,
      onClick: onOptimize,
      className: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
    },
    {
      id: 'template',
      label: 'Apply Template',
      icon: FileText,
      onClick: onApplyTemplate,
      className: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    },
    {
      id: 'scan',
      label: 'Scan Fields',
      icon: Search,
      onClick: onScanFields,
      className: 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={disabled}
            className={`${button.className} text-white font-semibold py-4 px-6 rounded-lg 
              transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center space-x-2`}
          >
            <Icon size={20} />
            <span>{button.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;