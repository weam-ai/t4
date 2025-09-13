import React from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import SearchForm from './components/SearchForm';
import DocumentDisplay from './components/DocumentDisplay';
import VideoRecommendations from './components/VideoRecommendations';
import ErrorDisplay from './components/ErrorDisplay';

const AppContent = () => {
  const { state, dispatch } = useLearning();

  const handleRetry = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Learning System
          </h1>
          <p className="text-lg text-gray-600">
            Discover comprehensive learning materials and video recommendations for any topic
          </p>
        </header>

        <SearchForm />
        
        <ErrorDisplay error={state.error} onRetry={handleRetry} />
        
        {state.loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Generating learning content...</p>
          </div>
        )}

        <DocumentDisplay document={state.document} topic={state.topic} />
        <VideoRecommendations videos={state.videos} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <LearningProvider>
      <AppContent />
    </LearningProvider>
  );
};

export default App;