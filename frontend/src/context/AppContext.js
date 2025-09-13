// context/AppContext.js (Updated with Enhanced Debug Integration)
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
  
  // OpenAI and Services
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
    
    case 'SAVE_DOCUMENT':
      const newDoc = {
        id: Date.now().toString(),
        topic: action.payload.topic,
        document: action.payload.document,
        videos: action.payload.videos,
        userId: state.user?.id || state.user?.email,
        createdAt: new Date().toISOString(),
        debugData: action.payload.debugData // Save debug data with document
      };
      const updatedDocs = [newDoc, ...state.savedDocuments];
      
      const storageKey = state.user ? `learningDocs_${state.user.id || state.user.email}` : 'learningDocs';
      localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
      
      return { 
        ...state, 
        savedDocuments: updatedDocs,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        lastGenerationDebugData: action.payload.debugData
      };
    
    case 'LOAD_DOCUMENTS':
      return { ...state, savedDocuments: action.payload };
    
    case 'DELETE_DOCUMENT':
      const filteredDocs = state.savedDocuments.filter(doc => doc.id !== action.payload);
      const deleteStorageKey = state.user ? `learningDocs_${state.user.id || state.user.email}` : 'learningDocs';
      localStorage.setItem(deleteStorageKey, JSON.stringify(filteredDocs));
      return { ...state, savedDocuments: filteredDocs };
    
    case 'VIEW_DOCUMENT':
      return {
        ...state,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        currentPage: 'chat',
        lastGenerationDebugData: action.payload.debugData || null
      };
    
    case 'CLEAR_CURRENT_DOCUMENT':
      return {
        ...state,
        currentTopic: '',
        currentDocument: '',
        currentVideos: [],
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
          
          // Load user-specific documents
          const userStorageKey = `learningDocs_${user.id || user.email}`;
          const savedDocs = localStorage.getItem(userStorageKey);
          if (savedDocs) {
            try {
              const documents = JSON.parse(savedDocs);
              dispatch({ type: 'LOAD_DOCUMENTS', payload: documents });
            } catch (error) {
              console.error('Failed to load saved documents:', error);
            }
          }
        } else {
          dispatch({ type: 'SET_PAGE', payload: 'login' });
        }

        // Initialize API keys and services
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

      // Save the generated content with debug data
      dispatch({
        type: 'SAVE_DOCUMENT',
        payload: {
          topic,
          document: results.document,
          videos: results.videos,
          debugData: results._debugData
        }
      });

      return {
        document: results.document,
        videos: results.videos,
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

  // Method to update API keys
  const updateOpenAIKey = (key) => {
    dispatch({ type: 'SET_OPENAI_KEY', payload: key });
  };

  const updateGeminiKey = (key) => {
    dispatch({ type: 'SET_GEMINI_KEY', payload: key });
  };

  // Method to get service status
  const getServiceStatus = () => {
    return {
      openaiConfigured: !!state.openaiApiKey,
      geminiConfigured: !!state.geminiApiKey,
      serviceCapabilities: state.openaiService?.getCapabilities() || {},
      debugConsoleAvailable: true
    };
  };

  const value = {
    state,
    dispatch,
    generateContent,
    logout,
    showDebugConsole,
    hideDebugConsole,
    updateOpenAIKey,
    updateGeminiKey,
    getServiceStatus
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