import React, { useState, createContext, useContext } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ProfileManager from './components/profile/ProfileManager';
import JobDescriptionParser from './components/parser/JobDescriptionParser';
import ResumeTailor from './components/resume/ResumeTailor';
import CoverLetterGenerator from './components/coverLetter/CoverLetterGenerator';
import ApplicationTracker from './components/tracker/ApplicationTracker';
import ConnectionTest from './components/common/ConnectionTest';
import { ToastProvider } from './components/ui/Toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { mockStore, mockQuery, mockRootProps } from './careerCopilotMockData';
import apiService from './services/api';

// Global Context
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(mockStore.user);
  const [profile, setProfile] = useState(mockStore.profile);
  const [settings, setSettings] = useState(mockStore.settings);
  const [applications, setApplications] = useState(mockQuery.applications);
  const [analytics, setAnalytics] = useState(mockQuery.analytics);
  const [notifications, setNotifications] = useState([]);

  const updateProfile = (newProfile) => {
    setProfile({ ...profile, ...newProfile });
  };

  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id, timestamp: new Date().toISOString() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const value = {
    user,
    profile,
    settings,
    applications,
    analytics,
    notifications,
    updateProfile,
    updateSettings,
    addNotification,
    setApplications
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

const CareerCopilotApp = () => {
  const [activeView, setActiveView] = useState(mockRootProps.initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [parsedJobData, setParsedJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
  const { user, profile, applications, analytics, updateProfile } = useAppContext();

  const handleViewChange = (view) => {
    if (view === activeView) return;
    
    setViewTransition(true);
    setIsLoading(true);
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setActiveView(view);
      setIsLoading(false);
      setTimeout(() => setViewTransition(false), 100);
    }, 300);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard analytics={analytics} applications={applications} />;
      case 'profile':
        return <ProfileManager profile={profile} onUpdateProfile={updateProfile} />;
      case 'parser':
        return <JobDescriptionParser onParseComplete={(data) => setParsedJobData(data)} />;
      case 'resume':
        return <ResumeTailor profile={profile} jobData={parsedJobData} />;
      case 'cover-letter':
        return <CoverLetterGenerator profile={profile} jobData={parsedJobData} />;
      case 'tracker':
        return <ApplicationTracker applications={applications} onUpdateApplication={(app) => console.log('Update:', app)} />;
      case 'analytics':
        return <div className="text-center py-20 text-gray-500">Advanced Analytics - Coming Soon</div>;
      case 'settings':
        return <div className="text-center py-20 text-gray-500">Settings - Coming Soon</div>;
      default:
        return <Dashboard analytics={analytics} applications={applications} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/5 to-cyan-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative flex min-h-screen">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isCollapsed={sidebarCollapsed}
        />
        
        <div className="flex-1 flex flex-col">
          <Header user={user} onToggleSidebar={toggleSidebar} />
          
          <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ${
            viewTransition ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}>
            {/* Backend Connection Status */}
            <div className="mb-6">
              <ConnectionTest />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="xl" text="Loading..." />
              </div>
            ) : (
              <div className="animate-fade-in">
                {renderContent()}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <CareerCopilotApp />
      </AppProvider>
    </ToastProvider>
  );
};

export default App;