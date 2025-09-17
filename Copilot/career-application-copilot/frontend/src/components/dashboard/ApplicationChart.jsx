import React from 'react';

const ApplicationChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.applications, d.interviews)));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Applications</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Interviews</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 flex items-end justify-between space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center space-y-2">
            <div className="w-full flex items-end space-x-1 h-32">
              <div
                className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg flex-1 transition-all duration-300 hover:shadow-lg"
                style={{ height: `${(item.applications / maxValue) * 100}%` }}
                title={`${item.applications} applications`}
              ></div>
              <div
                className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg flex-1 transition-all duration-300 hover:shadow-lg"
                style={{ height: `${(item.interviews / maxValue) * 100}%` }}
                title={`${item.interviews} interviews`}
              ></div>
            </div>
            <span className="text-sm text-gray-600 font-medium">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationChart;