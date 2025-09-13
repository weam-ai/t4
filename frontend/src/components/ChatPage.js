import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchTopic } from '../services/api';

const ChatPage = () => {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || state.loading) return;

    const userMessage = { type: 'user', content: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const results = await searchTopic(message);
      
      const aiMessage = {
        type: 'ai',
        content: 'I\'ve generated comprehensive learning content for your topic!',
        document: results.document,
        videos: results.videos,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Save the document
      dispatch({
        type: 'SAVE_DOCUMENT',
        payload: {
          topic: message,
          document: results.document,
          videos: results.videos
        }
      });
      
      setMessage('');
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      const errorMessage = {
        type: 'ai',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
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
            <h1 className="text-xl font-semibold text-gray-900">AI Learning Chat</h1>
            <p className="text-sm text-gray-600">Ask me to create learning content on any topic</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatHistory.length === 0 && !state.currentDocument && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a Learning Conversation</h3>
                <p className="text-gray-600 text-sm">
                  Type a topic below and I'll generate comprehensive learning materials with video recommendations.
                </p>
              </div>
            )}

            {/* Show current document if viewing existing one */}
            {state.currentDocument && chatHistory.length === 0 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-medium text-blue-900">{state.currentTopic}</h3>
                  </div>
                  <div className="prose max-w-none">
                    <div className="bg-white rounded p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {state.currentDocument}
                    </div>
                  </div>
                </div>

                {state.currentVideos && state.currentVideos.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Recommended Videos
                    </h4>
                    <div className="space-y-3">
                      {state.currentVideos.map((video, index) => (
                        <div key={index} className="bg-white rounded p-3 flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <a
                              href={video.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-900 hover:text-red-600 text-sm block mb-1"
                            >
                              {video.title}
                            </a>
                            <p className="text-xs text-gray-600 mb-1">by {video.channelName}</p>
                            <p className="text-xs text-gray-700">{video.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.type === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm">{msg.content}</p>
                      {msg.document && (
                        <div className="bg-white p-3 rounded text-xs text-gray-700 border">
                          <div className="font-medium mb-2">Generated Document:</div>
                          <div className="whitespace-pre-wrap">{msg.document.substring(0, 200)}...</div>
                        </div>
                      )}
                      {msg.videos && msg.videos.length > 0 && (
                        <div className="bg-white p-3 rounded text-xs border">
                          <div className="font-medium mb-2">Recommended Videos ({msg.videos.length}):</div>
                          <div className="space-y-1">
                            {msg.videos.slice(0, 2).map((video, i) => (
                              <div key={i}>
                                <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {video.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Message */}
            {state.loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Generating your learning content...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to learn about? (e.g., 'Quantum Computing basics', 'Machine Learning algorithms')"
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                rows="3"
                disabled={state.loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || state.loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;