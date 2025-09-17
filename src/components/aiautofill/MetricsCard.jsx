import React from 'react';
import { formatCount, formatPercentage, formatTime } from '../../aiAutoFillMockData';

const MetricsCard = ({ metrics }) => {
  const metricItems = [
    {
      label: 'Forms Filled',
      value: formatCount(metrics.formsCompleted),
      color: 'text-blue-400'
    },
    {
      label: 'Success Rate',
      value: formatPercentage(metrics.successRate),
      color: 'text-green-400'
    },
    {
      label: 'Time Saved',
      value: formatTime(metrics.timeSaved),
      color: 'text-purple-400'
    },
    {
      label: 'AI Accuracy',
      value: formatPercentage(metrics.aiAccuracy),
      color: 'text-cyan-400'
    }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-2 gap-6">
        {metricItems.map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`text-3xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            <div className="text-slate-400 text-sm font-medium">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsCard;