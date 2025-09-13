// components/DebugConsole.js (Complete Version)
import React, { useState, useEffect } from 'react';

const DebugConsole = ({ isOpen, onClose, analysisData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  useEffect(() => {
    if (isOpen && !analysisData) {
      console.warn('DebugConsole opened without analysis data');
    }
  }, [isOpen, analysisData]);

  if (!isOpen) return null;

  // Default data structure if analysisData is missing
  const defaultData = {
    originalPrompt: 'No data available',
    refinedPrompt: 'No data available',
    searchQuery: 'No data available',
    timestamp: new Date().toISOString(),
    processingSteps: [],
    documentGeneration: { status: 'unknown', wordCount: 0 },
    videoAnalysis: { videosFound: 0, videos: [] },
    openaiRole: { systemRole: 'Unknown', task: 'Unknown', model: 'Unknown', status: 'unknown' },
    geminiRole: { systemRole: 'Unknown', task: 'Unknown', model: 'Unknown', status: 'unknown' },
    performance: { totalTime: '0', totalApiCalls: 0, breakdown: [] }
  };

  const data = analysisData || defaultData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', color: 'blue' },
    { id: 'prompts', label: 'Prompts', icon: '💭', color: 'purple' },
    { id: 'ai-roles', label: 'AI Roles', icon: '🤖', color: 'green' },
    { id: 'processing', label: 'Processing', icon: '⚡', color: 'yellow' },
    { id: 'videos', label: 'Videos', icon: '🎥', color: 'red' },
    { id: 'performance', label: 'Performance', icon: '📈', color: 'indigo' }
  ];

  const toggleStepExpansion = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const formatJsonData = (data) => {
    if (!data) return 'No data';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Original Query:</span>
                  <p className="text-gray-900 bg-white border rounded p-2 mt-1">{data.originalPrompt}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Processing Time:</span>
                  <p className="text-gray-900 bg-white border rounded p-2 mt-1">{data.performance?.totalTime || '0'}s</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  data.documentGeneration?.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  📄
                </div>
                <p className="font-semibold text-gray-900">{data.documentGeneration?.wordCount || 0}</p>
                <p className="text-xs text-gray-600">Words Generated</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 mx-auto mb-2 rounded-full flex items-center justify-center">
                  🎥
                </div>
                <p className="font-semibold text-gray-900">{data.videoAnalysis?.videosFound || 0}</p>
                <p className="text-xs text-gray-600">Videos Found</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 mx-auto mb-2 rounded-full flex items-center justify-center">
                  🔧
                </div>
                <p className="font-semibold text-gray-900">{data.performance?.totalApiCalls || 0}</p>
                <p className="text-xs text-gray-600">API Calls</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 mx-auto mb-2 rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <p className="font-semibold text-gray-900">{data.performance?.totalTime || 0}s</p>
                <p className="text-xs text-gray-600">Total Time</p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">System Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">OpenAI</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.openaiRole?.status)}`}>
                    {data.openaiRole?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Gemini</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.geminiRole?.status)}`}>
                    {data.geminiRole?.status || 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'prompts':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Prompt Engineering Pipeline</h3>
              
              {/* Original Input */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h4 className="font-semibold text-gray-900">User Input</h4>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-800 font-mono text-sm">{data.originalPrompt}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <span>PROMPT REFINER</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m0 0l7-7m0 0l7 7" />
                  </svg>
                </div>
              </div>

              {/* Refined Prompt */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h4 className="font-semibold text-gray-900">Optimized Prompt</h4>
                </div>
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-gray-800 text-xs font-mono whitespace-pre-wrap">{data.refinedPrompt}</pre>
                </div>
              </div>

              {/* Search Query */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h4 className="font-semibold text-gray-900">Video Search Query</h4>
                </div>
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <p className="text-gray-800 font-mono text-sm">{data.searchQuery}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-roles':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* OpenAI Role */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
                    </svg>
                    <h3 className="font-semibold">OpenAI GPT</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">System Role</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 border rounded p-2">
                      {data.openaiRole?.systemRole || 'Expert educational content creator'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Primary Task</h4>
                    <p className="text-sm text-gray-700">
                      {data.openaiRole?.task || 'Generate comprehensive learning document'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900">Model</h4>
                      <p className="text-gray-700 font-mono">{data.openaiRole?.model || 'gpt-3.5-turbo'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Status</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.openaiRole?.status)}`}>
                        {data.openaiRole?.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Token Usage</h4>
                    <p className="text-sm text-gray-700">{data.openaiRole?.tokensUsed || data.performance?.openai?.tokensUsed || 'Estimated: ~3000'}</p>
                  </div>
                </div>
              </div>

              {/* Gemini Role */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <h3 className="font-semibold">Google Gemini</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">System Role</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 border rounded p-2">
                      {data.geminiRole?.systemRole || 'Educational content curator and video analyst'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Primary Task</h4>
                    <p className="text-sm text-gray-700">
                      {data.geminiRole?.task || 'Analyze and rank video content for educational value'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900">Model</h4>
                      <p className="text-gray-700 font-mono">{data.geminiRole?.model || 'gemini-2.0-flash'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Status</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.geminiRole?.status)}`}>
                        {data.geminiRole?.status || 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Videos Analyzed</h4>
                    <p className="text-sm text-gray-700">{data.performance?.gemini?.videosAnalyzed || data.videoAnalysis?.videosFound || 0} videos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interaction Flow */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">AI Processing Flow</h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                  <p className="text-sm font-medium">User Input</p>
                  <p className="text-xs text-gray-600">Raw query</p>
                </div>
                <div className="hidden md:block">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                  <p className="text-sm font-medium">Prompt Refiner</p>
                  <p className="text-xs text-gray-600">Optimize query</p>
                </div>
                <div className="hidden md:block">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                  <p className="text-sm font-medium">OpenAI</p>
                  <p className="text-xs text-gray-600">Generate content</p>
                </div>
                <div className="hidden md:block">→</div>
                <div className="text-center">
                  <div className={`w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-2 ${
                    data.geminiRole?.status === 'active' ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>4</div>
                  <p className="text-sm font-medium">Gemini</p>
                  <p className="text-xs text-gray-600">Analyze videos</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Timeline</h3>
              
              {data.processingSteps && data.processingSteps.length > 0 ? (
                <div className="space-y-4">
                  {data.processingSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step.status === 'completed' ? 'bg-green-500 text-white' :
                          step.status === 'error' ? 'bg-red-500 text-white' :
                          step.status === 'processing' ? 'bg-yellow-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{step.duration}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                                {step.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        
                        {(step.details || step.error) && (
                          <button
                            onClick={() => toggleStepExpansion(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <svg className={`w-4 h-4 transition-transform ${expandedSteps.has(index) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {expandedSteps.has(index) && (
                        <div className="mt-3 pl-11">
                          {step.details && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Details:</h5>
                              <pre className="bg-gray-50 border rounded p-3 text-xs font-mono overflow-x-auto">
                                {formatJsonData(step.details)}
                              </pre>
                            </div>
                          )}
                          {step.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <h5 className="text-sm font-medium text-red-800 mb-1">Error:</h5>
                              <p className="text-sm text-red-700">{step.error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No processing steps available</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'videos':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Video Analysis Results</h3>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              
              {data.videoAnalysis?.videos && data.videoAnalysis.videos.length > 0 ? (
                <div className="space-y-4">
                  {data.videoAnalysis.videos
                    .filter(video => 
                      !searchTerm || 
                      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      video.channelName?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((video, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
                          <p className="text-sm text-gray-600">Channel: {video.channelName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            video.relevanceScore >= 80 ? 'bg-green-100 text-green-800' :
                            video.relevanceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {video.relevanceScore}/100
                          </span>
                          {video._aiEnhanced && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              AI Enhanced
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span>
                          <p className="text-gray-600">{video.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Level:</span>
                          <p className="text-gray-600">{video.difficultyLevel}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Value:</span>
                          <p className="text-gray-600">{video.educationalValue}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Audience:</span>
                          <p className="text-gray-600">{video.audience || 'General'}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{video.summary}</p>

                      {video.strengths && video.strengths.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Strengths:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {video.strengths.map((strength, i) => (
                              <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {video.recommendation && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <span className="text-sm font-medium text-blue-900">AI Recommendation:</span>
                          <p className="text-sm text-blue-800 mt-1">{video.recommendation}</p>
                        </div>
                      )}

                      {video._analysisLog && (
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                            View Analysis Log
                          </summary>
                          <pre className="mt-2 bg-gray-50 border rounded p-3 text-xs font-mono overflow-x-auto max-h-40">
                            {formatJsonData(video._analysisLog)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No video analysis data available</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">OpenAI Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-mono">{data.performance?.gemini?.responseTime || '~1500ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos Analyzed:</span>
                    <span className="font-mono">{data.performance?.gemini?.videosAnalyzed || data.videoAnalysis?.videosFound || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-mono ${
                      data.performance?.gemini?.status === 'success' ? 'text-green-600' : 
                      data.performance?.gemini?.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {data.performance?.gemini?.status || 'inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Overall Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Time:</span>
                    <span className="font-mono">{data.performance?.totalTime || '0'}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls:</span>
                    <span className="font-mono">{data.performance?.totalApiCalls || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-mono">{data.performance?.successRate || '100'}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">API Call Breakdown</h4>
              {data.performance?.breakdown && data.performance.breakdown.length > 0 ? (
                <div className="space-y-3">
                  {data.performance.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'completed' ? 'bg-green-400' :
                          item.status === 'failed' ? 'bg-red-400' :
                          'bg-yellow-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{item.service}</p>
                          <p className="text-sm text-gray-600">{item.operation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{item.duration}</p>
                        <p className={`text-xs ${getStatusColor(item.status).replace('bg-', 'text-').replace('-100', '-600')}`}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No detailed breakdown available</p>
              )}
            </div>

            {/* Performance Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Response Time Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">API Response Times</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">OpenAI:</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <div className="text-xs text-gray-500">~2.0s</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">Gemini:</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                      </div>
                      <div className="text-xs text-gray-500">~1.5s</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Resource Usage</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Steps:</span>
                      <span className="font-mono">{data.processingSteps?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data Processed:</span>
                      <span className="font-mono">{((data.documentGeneration?.wordCount || 0) * 5)} chars</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage:</span>
                      <span className="font-mono">~{Math.round((data.performance?.totalApiCalls || 1) * 2.5)}MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a tab to view debug information</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Debug Console</h2>
              <p className="text-sm text-gray-600">Complete AI Processing Analysis & Performance Metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 bg-white text-${tab.color}-600`
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <TabContent />
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Generated: {new Date(data.timestamp).toLocaleString()}</span>
              <span>Original Query: "{data.originalPrompt.length > 30 ? data.originalPrompt.substring(0, 30) + '...' : data.originalPrompt}"</span>
            </div>
            <div className="flex items-center gap-4">
              <span>OpenAI: <span className={`font-medium ${data.openaiRole?.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{data.openaiRole?.status || 'Active'}</span></span>
              <span>Gemini: <span className={`font-medium ${data.geminiRole?.status === 'active' ? 'text-blue-600' : 'text-gray-600'}`}>{data.geminiRole?.status || 'Inactive'}</span></span>
              <span>Total: {data.performance?.totalTime || 0}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;