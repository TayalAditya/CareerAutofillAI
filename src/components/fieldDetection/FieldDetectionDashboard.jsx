import React from 'react';
import DashboardHeader from './DashboardHeader';
import FieldCard from './FieldCard';

const FieldDetectionDashboard = ({ detectionStatus, totalFields, autoFillableFields, fields, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <DashboardHeader 
          detectionStatus={detectionStatus}
          totalFields={totalFields}
          autoFillableFields={autoFillableFields}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FieldCard field={field} />
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Career AutoFill Assistant Ultimate Pro Max
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetectionDashboard;