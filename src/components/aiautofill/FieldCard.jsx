import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

const FieldCard = ({ field, index }) => {
  // Calculate confidence percentage
  const confidencePercent = Math.round(field.confidence * 100);
  
  return (
    <div className="bg-slate-900/50 rounded p-3 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-200 font-medium truncate">
          {field.label || `Field ${index + 1}`}
        </span>
        <div className="flex items-center space-x-2">
          {field.canFill ? (
            <Target size={14} className="text-green-400" />
          ) : (
            <AlertTriangle size={14} className="text-yellow-400" />
          )}
          <span className={`text-xs px-2 py-1 rounded ${
            confidencePercent > 80 ? 'bg-green-500/20 text-green-400' :
            confidencePercent > 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {confidencePercent}%
          </span>
        </div>
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div>Type: {field.fieldType || field.type} | Section: {field.section}</div>
        <div>{field.canFill ? `Will fill: "${field.value}"` : 'No data available'}</div>
      </div>
    </div>
  );
};

export default FieldCard;