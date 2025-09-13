import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import './index.css';

const AppContent = () => {
  const { state } = useApp();

  return (
    <div className="min-h-screen">
      {state.currentPage === 'dashboard' ? <Dashboard /> : <ChatPage />}
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