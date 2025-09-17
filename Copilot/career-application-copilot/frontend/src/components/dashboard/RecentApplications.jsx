import React from 'react';
import { formatApplicationStatus, formatDate } from '../../utils/formatters';
import { ApplicationStatus } from '../../careerCopilotMockData';

const RecentApplications = ({ applications }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case ApplicationStatus.INTERVIEW:
        return 'bg-green-100 text-green-800 border-green-200';
      case ApplicationStatus.IN_REVIEW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ApplicationStatus.APPLIED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ApplicationStatus.OFFER_RECEIVED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recent applications</p>
        </div>
      ) : (
        applications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {app.companyName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{app.position}</h4>
                <p className="text-sm text-gray-600">{app.companyName}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                {formatApplicationStatus(app.status)}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(new Date(app.appliedDate))}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentApplications;