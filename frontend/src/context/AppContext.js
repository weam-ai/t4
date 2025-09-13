import React, { createContext, useContext, useReducer, useEffect } from 'react';
import OpenAIService from '../services/openaiService';
import { authService } from '../services/authService';

const AppContext = createContext();

const initialState = {
  // Authentication
  user: null,
  authToken: '',
  isAuthenticated: false,
  
  // Page Navigation
  currentPage: 'loading',
  
  // App State
  savedDocuments: [],
  loading: false,
  error: null,
  currentTopic: '',
  currentDocument: '',
  currentVideos: [],
  currentResources: null, // Added for full resources data
  
  // OpenAI and Services (Kept for backward compatibility)
  openaiApiKey: '',
  geminiApiKey: '',
  openaiService: null,
  
  // Debug Console
  showDebugConsole: false,
  lastGenerationDebugData: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    
    case 'SET_AUTH_TOKEN':
      return { 
        ...state, 
        authToken: action.payload,
        isAuthenticated: !!action.payload
      };
    
    case 'LOGOUT':
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('openaiApiKey');
      localStorage.removeItem('geminiApiKey');
      return {
        ...initialState,
        currentPage: 'login'
      };
    
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_OPENAI_KEY':
      const geminiKey = localStorage.getItem('geminiApiKey');
      const service = action.payload ? new OpenAIService(action.payload, geminiKey) : null;
      
      if (action.payload) {
        localStorage.setItem('openaiApiKey', action.payload);
      } else {
        localStorage.removeItem('openaiApiKey');
      }
      
      return { 
        ...state, 
        openaiApiKey: action.payload,
        openaiService: service
      };
    
    case 'SET_GEMINI_KEY':
      const openaiKey = localStorage.getItem('openaiApiKey');
      const newService = openaiKey ? new OpenAIService(openaiKey, action.payload) : null;
      
      if (action.payload) {
        localStorage.setItem('geminiApiKey', action.payload);
      } else {
        localStorage.removeItem('geminiApiKey');
      }
      
      return { 
        ...state, 
        geminiApiKey: action.payload,
        openaiService: newService || state.openaiService
      };
    
    case 'SET_SAVED_DOCUMENTS':
      // Don't save to localStorage anymore - use API data only
      return { 
        ...state, 
        savedDocuments: action.payload 
      };
    
    case 'CLEAR_SAVED_DOCUMENTS':
      return { 
        ...state, 
        savedDocuments: [] 
      };
    
    case 'LOAD_DOCUMENTS':
      // Deprecated - kept for backward compatibility but won't be used
      return { ...state, savedDocuments: action.payload };
    
    case 'DELETE_DOCUMENT':
      // Remove from local state only - API deletion handled in components
      const filteredDocs = state.savedDocuments.filter(doc => doc.id !== action.payload);
      return { ...state, savedDocuments: filteredDocs };
    
    case 'SAVE_DOCUMENT':
      // Modified: Save to API instead of localStorage (handled in ChatPage)
      // This action now only updates current state
      return { 
        ...state, 
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        currentResources: action.payload.resources,
        lastGenerationDebugData: action.payload.debugData
      };
    
    case 'VIEW_DOCUMENT':
      return {
        ...state,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        currentResources: action.payload.resources,
        currentPage: 'chat',
        lastGenerationDebugData: action.payload.debugData || null
      };
    
    case 'SET_CURRENT_DOCUMENT':
      return {
        ...state,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        currentResources: action.payload.resources,
        lastGenerationDebugData: action.payload.debugData || null
      };
    
    case 'CLEAR_CURRENT_DOCUMENT':
      return {
        ...state,
        currentTopic: '',
        currentDocument: '',
        currentVideos: [],
        currentResources: null,
        lastGenerationDebugData: null
      };
    
    case 'SHOW_DEBUG_CONSOLE':
      return { ...state, showDebugConsole: true };
    
    case 'HIDE_DEBUG_CONSOLE':
      return { ...state, showDebugConsole: false };
    
    case 'SET_DEBUG_DATA':
      return { ...state, lastGenerationDebugData: action.payload };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const user = authService.getCurrentUser();
        
        if (token && user) {
          dispatch({ type: 'SET_AUTH_TOKEN', payload: token });
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
          
          // Clear any old localStorage documents and load from API
          const oldUserStorageKey = `learningDocs_${user.id || user.email}`;
          localStorage.removeItem(oldUserStorageKey);
          localStorage.removeItem('learningDocs'); // Clear global docs
          
        } else {
          dispatch({ type: 'SET_PAGE', payload: 'login' });
        }

        // Initialize API keys and services (kept for backward compatibility)
        const savedOpenAIKey = localStorage.getItem('openaiApiKey');
        const savedGeminiKey = localStorage.getItem('geminiApiKey');
        
        if (savedOpenAIKey) {
          const service = new OpenAIService(savedOpenAIKey, savedGeminiKey);
          dispatch({ type: 'SET_OPENAI_KEY', payload: savedOpenAIKey });
        }
        
        if (savedGeminiKey) {
          dispatch({ type: 'SET_GEMINI_KEY', payload: savedGeminiKey });
        }

      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_PAGE', payload: 'login' });
      }
    };

    initializeAuth();
  }, []);

  const generateContent = async (topic) => {
    // This method is now deprecated - use API call directly in components
    // Kept for backward compatibility
    if (!state.openaiService) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    if (!state.isAuthenticated) {
      throw new Error('Please log in to generate content.');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🚀 Starting enhanced content generation for:', topic);
      console.log('🔧 Service capabilities:', state.openaiService.getCapabilities());
      
      // Call the enhanced generateContent method
      const results = await state.openaiService.generateContent(topic);
      
      console.log('✅ Content generation completed:', {
        documentLength: results.document?.length,
        videosCount: results.videos?.length,
        hasDebugData: !!results._debugData,
        realVideos: results.videos?.filter(v => v.isRealVideo).length,
        geminiEnhanced: results.videos?.filter(v => v._aiEnhanced).length
      });

      // Log video details for debugging
      if (results.videos?.length > 0) {
        console.log('📹 Generated videos:', results.videos.map(v => ({
          title: v.title,
          channel: v.channelName,
          url: v.link,
          isReal: v.isRealVideo,
          aiEnhanced: v._aiEnhanced,
          relevanceScore: v.relevanceScore
        })));
      }

      // Update current state (API save handled in ChatPage)
      dispatch({
        type: 'SAVE_DOCUMENT',
        payload: {
          topic,
          document: results.document,
          videos: results.videos,
          resources: results.resources, // Include full resources
          debugData: results._debugData
        }
      });

      return {
        document: results.document,
        videos: results.videos,
        resources: results.resources,
        debugData: results._debugData
      };

    } catch (error) {
      console.error('❌ Content generation failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const showDebugConsole = () => {
    dispatch({ type: 'SHOW_DEBUG_CONSOLE' });
  };

  const hideDebugConsole = () => {
    dispatch({ type: 'HIDE_DEBUG_CONSOLE' });
  };

  // Method to update API keys (kept for backward compatibility)
  const updateOpenAIKey = (key) => {
    dispatch({ type: 'SET_OPENAI_KEY', payload: key });
  };

  const updateGeminiKey = (key) => {
    dispatch({ type: 'SET_GEMINI_KEY', payload: key });
  };

  // Method to get service status (kept for backward compatibility)
  const getServiceStatus = () => {
    return {
      openaiConfigured: !!state.openaiApiKey,
      geminiConfigured: !!state.geminiApiKey,
      serviceCapabilities: state.openaiService?.getCapabilities() || {},
      debugConsoleAvailable: true,
      isAuthenticated: state.isAuthenticated
    };
  };

  // New method to fetch dashboard data (can be used by Dashboard component if needed)
  const fetchDashboardData = async () => {
    // This can be called from Dashboard component directly, but provided here for convenience
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const apiUrl = process.env.REACT_APP_API_URL || '/api';
    const response = await fetch(`${apiUrl}/chats?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      const mappedDocs = result.data.chats.map(chat => ({
        id: chat._id,
        topic: chat.topic,
        document: chat.response.summary,
        videos: chat.response.resources.youtube,
        resources: chat.response.resources,
        createdAt: chat.createdAt,
        estimatedTime: chat.response.estimatedTime,
        difficulty: chat.response.difficulty,
        learningPath: chat.response.learningPath
      }));
      
      dispatch({
        type: 'SET_SAVED_DOCUMENTS',
        payload: mappedDocs
      });
      
      return mappedDocs;
    } else {
      throw new Error(result.message || 'Failed to fetch chat history');
    }
  };

  const value = {
    state,
    dispatch,
    generateContent, // Kept for backward compatibility
    logout,
    showDebugConsole,
    hideDebugConsole,
    updateOpenAIKey,
    updateGeminiKey,
    getServiceStatus,
    fetchDashboardData // New utility method
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};