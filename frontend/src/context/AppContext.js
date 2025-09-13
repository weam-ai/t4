import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  currentPage: 'dashboard', // 'dashboard' or 'chat'
  savedDocuments: [],
  loading: false,
  error: null,
  currentTopic: '',
  currentDocument: '',
  currentVideos: []
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
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
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('learningDocs');
    if (saved) {
      try {
        const documents = JSON.parse(saved);
        dispatch({ type: 'LOAD_DOCUMENTS', payload: documents });
      } catch (error) {
        console.error('Failed to load saved documents');
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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