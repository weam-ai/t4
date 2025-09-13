import React, { createContext, useContext, useReducer } from 'react';

const LearningContext = createContext();

const initialState = {
  loading: false,
  topic: '',
  document: '',
  videos: [],
  error: null
};

const learningReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TOPIC':
      return { ...state, topic: action.payload };
    case 'SET_RESULTS':
      return {
        ...state,
        document: action.payload.document,
        videos: action.payload.videos,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_RESULTS':
      return { ...state, document: '', videos: [], error: null };
    default:
      return state;
  }
};

export const LearningProvider = ({ children }) => {
  const [state, dispatch] = useReducer(learningReducer, initialState);

  return (
    <LearningContext.Provider value={{ state, dispatch }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};