import React from 'react';
import { TrendingUp, Cpu, Zap, Target } from 'lucide-react';
import Badge from '../ui/Badge';

const ModelPerformance = ({ 
  accuracy = 0, 
  speed = 0, 
  confidence = 0,
  modelVersion = 'v1.0',
  lastUpdated = null 
}) => {
  const getPerformanceColor = (value) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const metrics = [
    {
      label: 'Accuracy',
      value: accuracy,
      icon: Target,
      suffix: '%'
    },
    {
      label: 'Speed',
      value: speed,
      icon: Zap,
      suffix: 'ms'
    },
    {
      label: 'Confidence',
      value: confidence,
      icon: TrendingUp,
      suffix: '%'
    }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-slate-100 font-semibold">Model Performance</h3>
        </div>
        <Badge variant="ai" size="sm">
          {modelVersion}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const variant = getPerformanceColor(metric.value);
          
          return (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className={`w-4 h-4 ${
                  variant === 'success' ? 'text-green-400' :
                  variant === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`} />
              </div>
              <div className={`text-lg font-bold ${
                variant === 'success' ? 'text-green-400' :
                variant === 'warning' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metric.value}{metric.suffix}
              </div>
              <div className="text-xs text-slate-400">{metric.label}</div>
            </div>
          );
        })}
      </div>

      {lastUpdated && (
        <div className="text-xs text-slate-500 text-center border-t border-slate-700 pt-2">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ModelPerformance;