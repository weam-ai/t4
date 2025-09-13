// services/authService.js (Fixed Version)
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8888";

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Use React Router navigation instead of window.location
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await authClient.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      console.log("Register response:", response.data);

      if (response.data.success && response.data.data) {
        // Store user object (since no token returned on register)
        localStorage.setItem("user", JSON.stringify(response.data.data));

        return {
          user: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed"
      );
    }
  },

  // Login user - FIXED to handle your response format consistently
  login: async (credentials) => {
    try {
      const response = await authClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      console.log("Login response:", response.data);

      // Handle your API response format: { success: true, data: { token: "..." }, message: "..." }
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        localStorage.setItem("authToken", token);

        // Store user data if provided
        if (response.data.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        } else {
          // Create basic user object if not provided
          const basicUser = {
            email: credentials.email,
          };
          localStorage.setItem("user", JSON.stringify(basicUser));
        }

        return {
          token: token,
          user: response.data.data.user || { email: credentials.email },
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed"
      );
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("openaiApiKey"); // Clear OpenAI key on logout
    // Don't use window.location.href - let React handle navigation
    return true;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem("authToken");
  },
};

export default authService;
