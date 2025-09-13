import React, { useState } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

const ChatPage = () => {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleBack = () => {
    dispatch({ type: "SET_PAGE", payload: "dashboard" });
    dispatch({ type: "CLEAR_CURRENT_DOCUMENT" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || state.loading) return;

    const userMessage = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const apiUrl = process.env.REACT_APP_API_URL || "/api";
      const response = await axios.post(
        `${apiUrl}/resources`,
        { topic: message.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;

      if (result.success) {
        const { data } = result;

        const aiMessage = {
          type: "ai",
          content: `I've curated a learning path for "${data.topic}"! Estimated time: ${data.estimatedTime} | Difficulty: ${data.difficulty}`,
          topic: data.topic,
          summary: data.summary,
          resources: data.resources,
          learningPath: data.learningPath,
          timestamp: new Date(),
        };

        setChatHistory((prev) => [...prev, aiMessage]);

        dispatch({
          type: "SET_CURRENT_DOCUMENT",
          payload: {
            document: data.summary,
            topic: data.topic,
            videos: data.resources.youtube,
            resources: data.resources,
          },
        });
      } else {
        throw new Error(result.message || "Failed to generate resources");
      }
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: `Sorry, I encountered an error: ${
          error.response?.data?.message || error.message
        }`,
        timestamp: new Date(),
        isError: true,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4 font-poppins">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mt-10 mb-6 font-poppins">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-8 font-poppins">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 mb-3 flex items-start"><span class="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3"></span>$1</li>')
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
  };

  const VideoCard = ({ video, index }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-base font-bold font-poppins flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-lg text-gray-900 hover:text-red-600 font-poppins mb-3 block leading-snug transition-colors duration-200"
          >
            {video.title}
            <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-base text-gray-600 font-medium">{video.channel}</span>
            {video.duration && (
              <span className="text-base text-gray-500">({video.duration})</span>
            )}
          </div>
          <p className="text-base text-gray-600 leading-relaxed">{video.description}</p>
        </div>
      </div>
    </div>
  );

  const ResourceCard = ({ resource, index, type }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold font-poppins flex-shrink-0 ${
            type === "documentation"
              ? "bg-blue-500 text-white"
              : type === "youtube"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium text-lg font-poppins mb-3 block leading-snug transition-colors duration-200 ${
              type === "documentation"
                ? "text-blue-600 hover:text-blue-800"
                : type === "youtube"
                ? "text-red-600 hover:text-red-800"
                : "text-green-600 hover:text-green-800"
            }`}
          >
            {resource.title}
            <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-base text-gray-600 mb-3 leading-relaxed">{resource.description}</p>
          {resource.source && (
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded font-medium">
              {resource.source}
            </span>
          )}
          {type === "googleLinks" && resource.searchQuery && (
            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded font-medium ml-2">
              Search: {resource.searchQuery}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-inter flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 font-poppins">
                  AI Learning Assistant
                </h1>
                <p className="text-base text-gray-600">Discover resources for any topic</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 sm:px-8 lg:px-12 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto space-y-8">
            {chatHistory.length === 0 && !state.currentDocument && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 font-poppins mb-4">
                  Start Learning Today
                </h3>
                <p className="text-base text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
                  Type any topic below to get curated learning resources, including documentation, videos, and personalized learning paths.
                </p>
              
              </div>
            )}

            {state.currentDocument && chatHistory.length === 0 && (
              <div className="space-y-10">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-teal-500 text-white rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 font-poppins">{state.currentTopic}</h2>
                  </div>
                  <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 font-poppins mb-4">Overview</h3>
                    <div className="prose prose-base max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(state.currentDocument) }} />
                  </div>
                  {state.currentResources?.learningPath && (
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 font-poppins mb-6">Learning Path</h3>
                      <div className="grid md:grid-cols-3 gap-8">
                        {Object.entries(state.currentResources.learningPath).map(([level, steps]) => (
                          <div key={level} className="space-y-4">
                            <h4 className={`font-semibold text-base uppercase tracking-wide font-poppins ${
                              level === "beginner" ? "text-green-600" : level === "intermediate" ? "text-blue-600" : "text-purple-600"
                            }`}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </h4>
                            <ul className="space-y-3 text-base text-gray-600">
                              {steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <svg className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {state.currentResources?.documentation?.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-poppins">Documentation Resources</h3>
                    </div>
                    <div className="grid gap-6">
                      {state.currentResources.documentation.map((resource, index) => (
                        <ResourceCard key={index} resource={resource} index={index} type="documentation" />
                      ))}
                    </div>
                  </div>
                )}
                {state.currentVideos?.length > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-poppins">Recommended Learning Videos</h3>
                    </div>
                    <div className="grid gap-6">
                      {state.currentVideos.map((video, index) => (
                        <VideoCard key={index} video={video} index={index} />
                      ))}
                    </div>
                  </div>
                )}
                {state.currentResources?.googleLinks?.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-poppins">Additional Search Resources</h3>
                    </div>
                    <div className="grid gap-6">
                      {state.currentResources.googleLinks.map((resource, index) => (
                        <ResourceCard key={index} resource={resource} index={index} type="googleLinks" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} mb-6`}>
                {msg.type === "user" ? (
                  <div className="max-w-md px-5 py-4 bg-teal-600 text-white rounded-2xl rounded-br-none shadow-sm">
                    <p className="text-base leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-full w-full">
                    <div className={`px-5 py-4 rounded-2xl rounded-bl-none shadow-sm ${
                      msg.isError ? "bg-red-50 text-red-900 border border-red-200" : "bg-gray-50 text-gray-900"
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.isError ? "bg-red-200" : "bg-teal-200"
                        }`}>
                          <svg className={`w-4 h-4 ${msg.isError ? "text-red-600" : "text-teal-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-base font-medium font-poppins">AI Assistant</span>
                      </div>
                      <p className="text-base mb-4 leading-relaxed">{msg.content}</p>
                      {msg.summary && (
                        <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-base font-semibold text-gray-900 font-poppins">Overview: {msg.topic}</span>
                          </div>
                          <div className="text-base text-gray-700 prose prose-base max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.summary) }} />
                        </div>
                      )}
                      {msg.learningPath && (
                        <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 44">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-base font-semibold text-gray-900 font-poppins">Learning Path</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
                            {Object.entries(msg.learningPath).map(([level, steps]) => (
                              <div key={level}>
                                <h4 className={`font-semibold text-gray-800 font-poppins mb-3 capitalize ${level === "beginner" ? "text-green-600" : level === "intermediate" ? "text-blue-600" : "text-purple-600"}`}>
                                  {level}
                                </h4>
                                <ul className="space-y-3">
                                  {steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600">
                                      <span className="w-2 h-2 bg-teal-500 rounded-full mt-2"></span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.resources?.youtube?.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            <span className="text-base font-semibold text-gray-900 font-poppins">Learning Videos ({msg.resources.youtube.length})</span>
                          </div>
                          <div className="grid gap-3">
                            {msg.resources.youtube.slice(0, 3).map((video, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold font-poppins">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-red-600 hover:text-red-800 hover:underline block truncate font-poppins"
                                  >
                                    {video.title}
                                  </a>
                                  <div className="flex items-center gap-3 text-base text-gray-500">
                                    <span>{video.channel}</span>
                                    {video.duration && <span>• {video.duration}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {msg.resources.youtube.length > 3 && (
                              <div className="text-base text-gray-500 text-center pt-3 border-t border-gray-200">
                                +{msg.resources.youtube.length - 3} more videos
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {msg.resources?.documentation?.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-base font-semibold text-gray-900 font-poppins">Documentation ({msg.resources.documentation.length})</span>
                          </div>
                          <div className="grid gap-3">
                            {msg.resources.documentation.slice(0, 3).map((resource, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold font-poppins">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-blue-600 hover:text-blue-800 hover:underline block truncate font-poppins"
                                  >
                                    {resource.title}
                                  </a>
                                  <p className="text-base text-gray-500">{resource.description}</p>
                                </div>
                              </div>
                            ))}
                            {msg.resources.documentation.length > 3 && (
                              <div className="text-base text-gray-500 text-center pt-3 border-t border-gray-200">
                                +{msg.resources.documentation.length - 3} more resources
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {state.loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 text-gray-900 max-w-md px-5 py-4 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                    <span className="text-base font-medium font-poppins">Curating your learning path...</span>
                  </div>
                  <div className="mt-3 text-base text-gray-600">Fetching resources and videos...</div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t bg-gray-50 p-6">
            <div className="flex gap-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to learn about? (e.g., 'React Hooks', 'Digital Photography', 'Data Structures')"
                className="flex-1 resize-none border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent max-h-40 bg-white text-base"
                rows="3"
                disabled={state.loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || state.loading}
                className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {state.loading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;