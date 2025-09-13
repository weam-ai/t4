// App.js (Updated with Authentication)
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './index.css';

const AppContent = () => {
  const { state } = useApp();

  // Show loading screen while checking authentication
  if (state.currentPage === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning platform...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate page based on authentication and current page
  const renderCurrentPage = () => {
    // If not authenticated, only show login/register pages
    if (!state.isAuthenticated) {
      switch (state.currentPage) {
        case 'register':
          return <RegisterPage />;
        case 'login':
        default:
          return <LoginPage />;
      }
    }

    // If authenticated, show app pages
    switch (state.currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <ChatPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentPage()}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;