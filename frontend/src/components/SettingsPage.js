// components/SettingsPage.js (Enhanced Version)
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SettingsPage = () => {
  const { state, dispatch, updateOpenAIKey, updateGeminiKey } = useApp();
  const [apiKeys, setApiKeys] = useState({
    openai: state.openaiApiKey || '',
    gemini: state.geminiApiKey || ''
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    gemini: false
  });
  const [isTestingKeys, setIsTestingKeys] = useState({
    openai: false,
    gemini: false
  });
  const [testResults, setTestResults] = useState({
    openai: null,
    gemini: null
  });

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const handleApiKeyChange = (type, value) => {
    setApiKeys(prev => ({ ...prev, [type]: value }));
    setTestResults(prev => ({ ...prev, [type]: null }));
  };

  const toggleShowApiKey = (type) => {
    setShowApiKeys(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const saveApiKey = (type) => {
    const key = apiKeys[type].trim();
    
    if (type === 'openai') {
      updateOpenAIKey(key);
    } else if (type === 'gemini') {
      updateGeminiKey(key);
    }
    
    setTestResults(prev => ({ 
      ...prev, 
      [type]: { type: 'success', message: `${type.toUpperCase()} API key saved successfully!` }
    }));
    
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [type]: null }));
    }, 3000);
  };

  const removeApiKey = (type) => {
    setApiKeys(prev => ({ ...prev, [type]: '' }));
    
    if (type === 'openai') {
      updateOpenAIKey('');
    } else if (type === 'gemini') {
      updateGeminiKey('');
    }
    
    setTestResults(prev => ({ 
      ...prev, 
      [type]: { type: 'info', message: `${type.toUpperCase()} API key removed.` }
    }));
  };

  const testApiKey = async (type) => {
    const key = apiKeys[type].trim();
    
    if (!key) {
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { type: 'error', message: 'Please enter an API key first.' }
      }));
      return;
    }

    setIsTestingKeys(prev => ({ ...prev, [type]: true }));
    setTestResults(prev => ({ ...prev, [type]: null }));

    try {
      let testResult;
      
      if (type === 'openai') {
        testResult = await testOpenAIKey(key);
      } else if (type === 'gemini') {
        testResult = await testGeminiKey(key);
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { type: 'success', message: testResult.message }
      }));
      
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { type: 'error', message: error.message }
      }));
    } finally {
      setIsTestingKeys(prev => ({ ...prev, [type]: false }));
    }
  };

  const testOpenAIKey = async (key) => {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    
    if (response.ok) {
      return { message: 'OpenAI API key is valid and working!' };
    } else {
      const error = await response.json();
      throw new Error(error.error?.message || 'Invalid OpenAI API key');
    }
  };

  const testGeminiKey = async (key) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      }
    );
    
    if (response.ok) {
      return { message: 'Gemini API key is valid and working!' };
    } else {
      const error = await response.json();
      throw new Error(error.error?.message || 'Invalid Gemini API key');
    }
  };

  const ApiKeySection = ({ type, title, description, required = false, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            color === 'green' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {type === 'openai' ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {required && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Required
              </span>
            )}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          apiKeys[type] ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <div className="space-y-4">
        <div>
          <label htmlFor={`${type}Key`} className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              id={`${type}Key`}
              type={showApiKeys[type] ? 'text' : 'password'}
              value={apiKeys[type]}
              onChange={(e) => handleApiKeyChange(type, e.target.value)}
              placeholder={`Enter your ${title} API key`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              type="button"
              onClick={() => toggleShowApiKey(type)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKeys[type] ? (
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

        {testResults[type] && (
          <div className={`p-4 rounded-lg border ${
            testResults[type].type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            testResults[type].type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {testResults[type].type === 'success' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {testResults[type].type === 'error' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm">{testResults[type].message}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => testApiKey(type)}
            disabled={!apiKeys[type].trim() || isTestingKeys[type]}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isTestingKeys[type] ? (
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
            onClick={() => saveApiKey(type)}
            disabled={!apiKeys[type].trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Key
          </button>

          {apiKeys[type] && (
            <button
              onClick={() => removeApiKey(type)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
              <h1 className="text-2xl font-bold text-gray-900">API Configuration</h1>
              <p className="text-gray-600">Configure your AI services for enhanced learning experience</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Enhanced Feature Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">🚀 AI-Powered Learning Platform</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">OpenAI GPT (Required)</p>
                  <p className="text-gray-700">
                    • Generate comprehensive learning documents<br/>
                    • Smart prompt refinement and optimization<br/>
                    • Structured educational content creation<br/>
                    • Advanced language understanding
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google Gemini (Enhanced)</p>
                  <p className="text-gray-700">
                    • 🎯 Find REAL YouTube videos<br/>
                    • 🧠 Intelligent educational content analysis<br/>
                    • 📊 Video quality assessment<br/>
                    • 🔍 Advanced video discovery with direct links
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🎉 New Feature:</strong> With Gemini integration, we now find actual YouTube videos 
                with direct links instead of search queries. Get real educational content from channels like 
                Khan Academy, FreeCodeCamp, 3Blue1Brown, and more!
              </p>
            </div>
          </div>

          {/* API Key Sections */}
          <ApiKeySection
            type="openai"
            title="OpenAI"
            description="Required for generating learning documents and intelligent content creation. Enables the core functionality of the platform."
            required={true}
            color="green"
          />

          <ApiKeySection
            type="gemini"
            title="Google Gemini"
            description="🆕 Enhanced: Enables real YouTube video discovery with direct links and AI-powered educational analysis. Transform your learning with actual video content!"
            color="blue"
          />

          {/* Current System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current System Status</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Document Generation</span>
                <div className={`flex items-center gap-2 ${
                  apiKeys.openai ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    apiKeys.openai ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {apiKeys.openai ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Video Intelligence</span>
                <div className={`flex items-center gap-2 ${
                  apiKeys.gemini ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    apiKeys.gemini ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {apiKeys.gemini ? 'AI Enhanced' : 'Basic Mode'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Debug Console</span>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's New Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">🆕 What's New in This Update</h3>
            <div className="space-y-3 text-sm text-purple-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">🎯 Real YouTube Videos:</span>
                <span>Gemini now finds actual YouTube videos with direct watch links instead of search queries</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">🧠 Enhanced AI Analysis:</span>
                <span>Improved video quality assessment and educational value scoring</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">🔍 Debug Console:</span>
                <span>Complete visibility into AI processing with detailed analytics and performance metrics</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">⚡ Better Performance:</span>
                <span>Optimized API calls and improved response times for faster content generation</span>
              </div>
            </div>
          </div>

          {/* API Key Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Get API Keys</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">OpenAI API Key (Required)</p>
                  <p className="text-gray-600 mb-2">
                    Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">platform.openai.com/api-keys</a>, 
                    create an account, and generate a new API key.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800">
                    This is required for basic functionality - document generation and content creation.
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google Gemini API (Enhanced Experience)</p>
                  <p className="text-gray-600 mb-2">
                    Visit <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">ai.google.dev</a>, 
                    get started with Gemini API, and generate your API key.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
                    🚀 Unlocks real YouTube video discovery and advanced AI analysis features!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;