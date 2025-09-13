import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchTopic = async (topic) => {
  try {
    const response = await api.post('/search', { topic });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Search failed');
  }
};

export default api;