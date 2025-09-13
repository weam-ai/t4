// components/SettingsPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SettingsPage = () => {
  const { state, dispatch } = useApp();
  const [apiKey, setApiKey] = useState(state.openaiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const handleSaveApiKey = () => {
    dispatch({ type: 'SET_OPENAI_KEY', payload: apiKey.trim() });
    setTestResult({ type: 'success', message: 'API key saved successfully!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    dispatch({ type: 'SET_OPENAI_KEY', payload: '' });
    setTestResult({ type: 'info', message: 'API key removed.' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ type: 'error', message: 'Please enter an API key first.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const testService = new (await import('../services/openaiService')).default(apiKey.trim());
      
      // Simple test call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        setTestResult({ type: 'success', message: 'API key is valid and working!' });
      } else {
        const error = await response.json();
        setTestResult({ type: 'error', message: error.error?.message || 'Invalid API key' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Failed to test API key. Check your connection.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Configure your OpenAI API key</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">OpenAI API Configuration</h2>
            <p className="text-gray-600 text-sm">
              Enter your OpenAI API key to enable dynamic document generation. 
              You can get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">OpenAI Dashboard</a>.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Status Message */}
            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                testResult.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.type === 'success' && (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {testResult.type === 'error' && (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={testApiKey}
                disabled={!apiKey.trim() || isTestingKey}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isTestingKey ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Key
                  </>
                )}
              </button>

              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save API Key
              </button>

              {state.openaiApiKey && (
                <button
                  onClick={handleRemoveApiKey}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove Key
                </button>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Status</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${state.openaiApiKey ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">
                {state.openaiApiKey ? 'API key configured - Ready to generate content' : 'No API key configured'}
              </span>
            </div>
          </div>

          {/* Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Information:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your API key is stored locally in your browser</li>
              <li>• API calls are made directly to OpenAI from your browser</li>
              <li>• You will be charged according to OpenAI's pricing</li>
              <li>• Never share your API key with others</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;