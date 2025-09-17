import React from 'react';

const DetectionStats = ({ sectionsCount, totalFields, fillableFields }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-cyan-400">
          {sectionsCount}
        </div>
        <div className="text-slate-400 text-sm">Sections</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">
          {totalFields}
        </div>
        <div className="text-slate-400 text-sm">Total Fields</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">
          {fillableFields}
        </div>
        <div className="text-slate-400 text-sm">Auto-fillable</div>
      </div>
    </div>
  );
};

export default DetectionStats;