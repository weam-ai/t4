// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import OpenAIService from '../services/openaiService';

const AppContext = createContext();

const initialState = {
  currentPage: 'dashboard', // 'dashboard', 'chat', or 'settings'
  savedDocuments: [],
  loading: false,
  error: null,
  currentTopic: '',
  currentDocument: '',
  currentVideos: [],
  openaiApiKey: '',
  openaiService: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_OPENAI_KEY':
      const service = action.payload ? new OpenAIService(action.payload) : null;
      // Save API key to localStorage (in real app, consider more secure storage)
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
    
    case 'SAVE_DOCUMENT':
      const newDoc = {
        id: Date.now().toString(),
        topic: action.payload.topic,
        document: action.payload.document,
        videos: action.payload.videos,
        createdAt: new Date().toISOString()
      };
      const updatedDocs = [newDoc, ...state.savedDocuments];
      localStorage.setItem('learningDocs', JSON.stringify(updatedDocs));
      return { 
        ...state, 
        savedDocuments: updatedDocs,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos
      };
    
    case 'LOAD_DOCUMENTS':
      return { ...state, savedDocuments: action.payload };
    
    case 'DELETE_DOCUMENT':
      const filteredDocs = state.savedDocuments.filter(doc => doc.id !== action.payload);
      localStorage.setItem('learningDocs', JSON.stringify(filteredDocs));
      return { ...state, savedDocuments: filteredDocs };
    
    case 'VIEW_DOCUMENT':
      return {
        ...state,
        currentTopic: action.payload.topic,
        currentDocument: action.payload.document,
        currentVideos: action.payload.videos,
        currentPage: 'chat'
      };
    
    case 'CLEAR_CURRENT_DOCUMENT':
      return {
        ...state,
        currentTopic: '',
        currentDocument: '',
        currentVideos: []
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load saved documents
    const savedDocs = localStorage.getItem('learningDocs');
    if (savedDocs) {
      try {
        const documents = JSON.parse(savedDocs);
        dispatch({ type: 'LOAD_DOCUMENTS', payload: documents });
      } catch (error) {
        console.error('Failed to load saved documents');
      }
    }

    // Load saved API key
    const savedApiKey = localStorage.getItem('openaiApiKey');
    if (savedApiKey) {
      dispatch({ type: 'SET_OPENAI_KEY', payload: savedApiKey });
    }
  }, []);

  const generateContent = async (topic) => {
    if (!state.openaiService) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Generate document and video recommendations in parallel
      const [document, videos] = await Promise.all([
        state.openaiService.generateLearningDocument(topic),
        state.openaiService.generateVideoRecommendations(topic)
      ]);

      // Save the generated content
      dispatch({
        type: 'SAVE_DOCUMENT',
        payload: {
          topic,
          document,
          videos
        }
      });

      return { document, videos };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    state,
    dispatch,
    generateContent
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