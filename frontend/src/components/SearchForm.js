import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { searchTopic } from '../services/api';

const SearchForm = () => {
  const [inputTopic, setInputTopic] = useState('');
  const { state, dispatch } = useLearning();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputTopic.trim()) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_TOPIC', payload: inputTopic });
    dispatch({ type: 'CLEAR_RESULTS' });

    try {
      const results = await searchTopic(inputTopic);
      dispatch({ type: 'SET_RESULTS', payload: results });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={inputTopic}
          onChange={(e) => setInputTopic(e.target.value)}
          placeholder="Enter a topic to learn about (e.g., Quantum Computing basics)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={state.loading}
        />
        <button
          type="submit"
          disabled={state.loading || !inputTopic.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {state.loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;