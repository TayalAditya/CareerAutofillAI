import React from 'react';
import { CircleCheck } from 'lucide-react';
import Badge from '../ui/Badge';

const DashboardHeader = ({ detectionStatus, totalFields, autoFillableFields }) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <CircleCheck size={32} className="text-green-500" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Field Detection</h1>
          <Badge variant="success" className="mt-1">
            {detectionStatus}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <div className="text-3xl font-bold text-blue-500">{totalFields}</div>
          <div className="text-sm text-gray-400 mt-1">Total Fields</div>
        </div>
        <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <div className="text-3xl font-bold text-green-500">{autoFillableFields}</div>
          <div className="text-sm text-gray-400 mt-1">Auto-fillable</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;