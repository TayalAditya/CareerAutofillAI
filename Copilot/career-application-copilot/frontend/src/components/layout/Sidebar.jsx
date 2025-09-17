import React from 'react';
import { LayoutGrid, SquareUser, FileSearch2, FileText, Mail, List, ChartColumnIncreasing, Settings } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, isCollapsed = false }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: SquareUser },
    { id: 'parser', label: 'Job Parser', icon: FileSearch2 },
    { id: 'resume', label: 'Resume Tailor', icon: FileText },
    { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
    { id: 'tracker', label: 'Applications', icon: List },
    { id: 'analytics', label: 'Analytics', icon: ChartColumnIncreasing },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen sticky top-0`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Career Copilot</h1>
              <p className="text-sm text-gray-600">AI-Powered Assistant</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                {!isCollapsed && (
                  <span className={`font-medium ${isActive ? 'text-blue-600' : ''}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;