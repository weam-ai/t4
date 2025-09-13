import React, { useEffect, useState } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import DebugConsole from "../components/DebugConsole";
import ConfirmModal from "./ConfirmModal";

const Dashboard = () => {
  const { state, dispatch, logout } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });

  // open modal with config
  const openConfirmModal = (title, message, action) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
    });
  };

  const closeConfirmModal = () =>
    setConfirmModal({ isOpen: false, action: null, title: "", message: "" });

  const fetchChats = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const apiUrl = process.env.REACT_APP_API_URL || "/api";
      const response = await axios.get(
        `${apiUrl}/chats?page=${page}&limit=${pagination.limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { data } = response.data;

        const mappedDocuments = data.chats.map((chat) => ({
          id: chat._id,
          topic: chat.topic,
          document: chat.response.summary,
          videos: chat.response.resources.youtube,
          resources: chat.response.resources,
          learningPath: chat.response.learningPath,
          createdAt: chat.createdAt,
          estimatedTime: chat.response.estimatedTime,
          difficulty: chat.response.difficulty,
        }));

        dispatch({
          type: "SET_SAVED_DOCUMENTS",
          payload: mappedDocuments,
        });

        setPagination({
          currentPage: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
          limit: data.pagination.limit,
        });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch chat history"
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch({ type: "CLEAR_SAVED_DOCUMENTS" });
    fetchChats(pagination.currentPage);
  }, [dispatch]);

  const handleAddNew = () => {
    dispatch({ type: "SET_PAGE", payload: "chat" });
    dispatch({ type: "CLEAR_CURRENT_DOCUMENT" });
  };

  const handleViewDocument = (doc) => {
    dispatch({
      type: "SET_CURRENT_DOCUMENT",
      payload: {
        ...doc,
        learningPath: doc.learningPath,
      },
    });
    dispatch({ type: "SET_PAGE", payload: "chat" });
  };

  const handleDeleteDocument = (docId) => {
    openConfirmModal(
      "Delete Learning Path",
      "Are you sure you want to delete this learning path? This action cannot be undone.",
      async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token)
            throw new Error("No authentication token found. Please log in.");

          const apiUrl = process.env.REACT_APP_API_URL || "/api";
          await axios.delete(`${apiUrl}/chats/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          fetchChats(pagination.currentPage);
          setError(null);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to delete document");
          console.error("Delete error:", err);
        } finally {
          closeConfirmModal();
        }
      }
    );
  };

  const handleLogout = () => {
    openConfirmModal("Logout", "Are you sure you want to log out?", () => {
      logout();
      closeConfirmModal();
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchChats(newPage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    // Full-width page container already, keep as-is
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm">
        {/* CHANGED: remove max-w-7xl mx-auto -> use full width */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              {/* CHANGED: larger heading */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-poppins">
                Learning Dashboard
              </h1>
              {/* CHANGED: slightly larger helper text */}
              <p className="text-base md:text-lg text-gray-600 mt-1">
                Welcome, {state.user?.name || "User"}! Explore your learning
                journey.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {state.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden md:block">
                  {/* CHANGED: bump sizes a notch */}
                  <p className="text-base md:text-lg font-medium text-gray-900">
                    {state.user?.name}
                  </p>
                  <p className="text-sm md:text-base text-gray-500">
                    {state.user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                title="Logout"
              >
                <svg
                  className="w-6 h-6"
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
              <button
                onClick={handleAddNew}
                className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                New Learning Path
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500">
          {/* CHANGED: full width wrapper */}
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-600"
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
                {/* CHANGED: bump error text a bit */}
                <span className="text-base md:text-lg text-red-800 font-medium">
                  {error}
                </span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-sm md:text-base text-red-600 hover:text-red-800 font-medium transition-colors duration-200 focus:outline-none focus:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* CHANGED: remove max-w-7xl mx-auto -> full width */}
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            {/* CHANGED: slightly larger loading text */}
            <p className="text-base md:text-lg text-gray-600 font-medium">
              Loading your learning paths...
            </p>
          </div>
        ) : state.savedDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-teal-600"
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
            {/* CHANGED: larger empty-state title */}
            <h2 className="text-3xl font-bold text-gray-900 font-poppins mb-4">
              Start Your Learning Journey
            </h2>
            {/* CHANGED: larger body */}
            <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Create your first AI-generated learning path with curated
              resources and videos to master any topic.
            </p>
            <button
              onClick={handleAddNew}
              className="px-8 py-3 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 mx-auto font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
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
          <div>
            <div className="flex justify-between items-center mb-8">
              {/* CHANGED: larger section heading */}
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 font-poppins">
                Your Learning Paths ({pagination.total} total)
              </h2>
              {/* CHANGED: slightly larger meta text */}
              <span className="text-sm md:text-base text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages} •
                Updated {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* Grid benefits from full width now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {state.savedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                >
                  {/* Top section */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* Title */}
                      <h3 className="font-semibold text-lg md:text-xl text-gray-900 font-poppins line-clamp-2 leading-snug">
                        {doc.topic}
                      </h3>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
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

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {doc.document.substring(0, 150)}...
                    </p>
                  </div>

                  {/* Meta info + button */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4">
                      <span>{formatDate(doc.createdAt)}</span>
                      <div className="flex items-center gap-3">
                        <span>{doc.videos?.length || 0} videos</span>
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs md:text-sm font-medium">
                          {doc.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="w-full bg-teal-50 text-teal-700 py-2.5 rounded-full hover:bg-teal-100 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      Explore Path
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <span>Page {pagination.currentPage}</span>
                  <span>of {pagination.totalPages}</span>
                  <span>({pagination.total} total)</span>
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onCancel={closeConfirmModal}
        onConfirm={confirmModal.action}
      />
    </div>
  );
};

export default Dashboard;
