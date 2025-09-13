// components/Dashboard.js (Updated with Authentication)
import React from "react";
import { useApp } from "../context/AppContext";
import DebugConsole from "../components/DebugConsole"

const Dashboard = () => {
  const { state, dispatch, logout } = useApp();

  const handleAddNew = () => {
    dispatch({ type: "SET_PAGE", payload: "chat" });
    dispatch({ type: "CLEAR_CURRENT_DOCUMENT" });
  };

  const handleViewDocument = (doc) => {
    dispatch({ type: "VIEW_DOCUMENT", payload: doc });
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm("Delete this document?")) {
      dispatch({ type: "DELETE_DOCUMENT", payload: docId });
    }
  };

  const goToSettings = () => {
    dispatch({ type: "SET_PAGE", payload: "settings" });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Learning Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {state.user?.name || "User"}! Your AI-powered
                  learning companion
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {state.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {state.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{state.user?.email}</p>
                  </div>
                </div>

                {/* Settings Button */}
                <button
                  onClick={goToSettings}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>

                {/* Create New Button */}
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Content
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* API Key Status Banner */}
        {!state.openaiApiKey && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    OpenAI API key not configured. Please add your API key to
                    enable dynamic content generation.
                  </span>
                </div>
                <button
                  onClick={goToSettings}
                  className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
                >
                  Configure API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {state.savedDocuments.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Smart Learning
              </h2>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Start your personalized learning journey by creating your first
                AI-generated learning document with curated video
                recommendations.
              </p>
              {!state.openaiApiKey && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>To get started:</strong> Configure your OpenAI API
                    key in settings to enable dynamic content generation.
                  </p>
                  <button
                    onClick={goToSettings}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Go to Settings →
                  </button>
                </div>
              )}
              <button
                onClick={handleAddNew}
                className={`px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2 font-medium ${
                  state.openaiApiKey
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!state.openaiApiKey}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Get Started
              </button>
            </div>
          ) : (
            // Documents Grid
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Learning Documents ({state.savedDocuments.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Saved to your personal library
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.savedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {doc.topic}
                      </h3>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {doc.document.substring(0, 150)}...
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{formatDate(doc.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <span>{doc.videos?.length || 0} videos</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          Private
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      View Document
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <DebugConsole />
    </>
  );
};

export default Dashboard;
