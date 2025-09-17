import React from 'react';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  MessageSquare,
  TrendingUp 
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, isOpen = true }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Performance', icon: BarChart3 },
    { id: 'users', label: 'Test Cases', icon: Users },
    { id: 'reports', label: 'Models', icon: FileText },
    { id: 'calendar', label: 'Algorithms', icon: Calendar },
    { id: 'messages', label: 'Documentation', icon: MessageSquare },
    { id: 'trends', label: 'Metrics', icon: TrendingUp },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];
  
  return (
    <aside className={`
      bg-gray-900 text-white transition-all duration-300 flex flex-col
      ${isOpen ? 'w-64' : 'w-16'}
      lg:relative lg:translate-x-0
      ${isOpen ? 'fixed lg:static inset-y-0 left-0 z-50' : 'hidden lg:flex'}
    `}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          {isOpen && (
            <span className="text-xl font-bold">AI AutoFill</span>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 border-t border-gray-800">
        <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">JD</span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Aditya Tayal</p>
              <p className="text-xs text-gray-400 truncate">Developer</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;