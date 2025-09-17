import React, { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Analytics from './components/pages/Analytics';
import TestCases from './components/pages/Users';
import Settings from './components/pages/Settings';

const ModernDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <TestCases />;
      case 'reports':
        return (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports</h3>
            <p className="text-gray-600">Reports functionality coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar</h3>
            <p className="text-gray-600">Calendar functionality coming soon...</p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600">Messages functionality coming soon...</p>
          </div>
        );
      case 'trends':
        return (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Trends</h3>
            <p className="text-gray-600">Trends functionality coming soon...</p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Overview',
      analytics: 'Performance',
      users: 'Test Cases',
      reports: 'Models',
      calendar: 'Algorithms',
      messages: 'Documentation',
      trends: 'Metrics',
      settings: 'Configuration'
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;