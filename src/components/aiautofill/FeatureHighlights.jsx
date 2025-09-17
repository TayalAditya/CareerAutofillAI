import React from 'react';
import { CheckCheck, Zap, Target, BarChart3 } from 'lucide-react';

const FeatureHighlights = ({ features }) => {
  const getFeatureIcon = (iconString) => {
    switch (iconString) {
      case 'CHECK':
        return CheckCheck;
      case 'LIGHTNING':
        return Zap;
      case 'TARGET':
        return Target;
      case 'CHART':
        return BarChart3;
      default:
        return CheckCheck;
    }
  };

  const getFeatureColor = (index) => {
    const colors = [
      'text-green-400 bg-green-500/20',
      'text-blue-400 bg-blue-500/20',
      'text-purple-400 bg-purple-500/20',
      'text-cyan-400 bg-cyan-500/20'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-slate-100 font-semibold text-lg mb-4">Technical Capabilities</h3>
      <div className="space-y-3">
        {features.map((feature, index) => {
          const Icon = getFeatureIcon(feature.icon);
          const colorClass = getFeatureColor(index);
          
          return (
            <div key={feature.id} className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]}`}>
                <Icon size={16} className={colorClass.split(' ')[0]} />
              </div>
              <div className="flex-1">
                <span className="text-slate-300 text-sm font-medium">
                  {feature.title}
                </span>
              </div>
              {feature.enabled && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureHighlights;