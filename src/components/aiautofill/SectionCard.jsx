import React from 'react';
import { File, Briefcase, Bot } from 'lucide-react';

const SectionCard = ({ section, index }) => {
  // Determine icon based on section name
  let IconComponent = File;
  let iconColor = "blue";
  
  if (section.name.includes('Professional') || section.id === 'professional') {
    IconComponent = Briefcase;
    iconColor = "green";
  } else if (section.name.includes('AutoFill') || section.id === 'autofill') {
    IconComponent = Bot;
    iconColor = "purple";
  }
  
  // Calculate confidence percentage
  const confidencePercent = Math.round(section.confidence * 100);
  
  return (
    <div key={index} className="bg-slate-900/50 rounded p-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IconComponent size={14} className={`text-${iconColor}-400`} />
          <span className="text-slate-200 font-medium">{section.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">{section.fieldCount} fields</span>
          <span className={`px-2 py-1 rounded text-xs ${
            confidencePercent >= 90 ? 'bg-green-500/20 text-green-400' :
            confidencePercent >= 70 ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {confidencePercent}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;