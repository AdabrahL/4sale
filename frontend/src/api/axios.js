// src/api/axios.js
import axios from "axios";

const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${backendBase}/api`,
  timeout: 15000, // 15 second timeout
});

// Attach token automatically if present (Bearer token method)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("AUTH_TOKEN");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for retry logic on network errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Initialize retry count
    if (!config || config.__retryCount === undefined) {
      if (config) config.__retryCount = 0;
    }

    // Check if we've exceeded retry limit
    const retryLimit = 3;
    if (!config || config.__retryCount >= retryLimit) {
      return Promise.reject(error);
    }

    // Network errors that should be retried
    const shouldRetry =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message === "Network Error" ||
      (error.response && error.response.status >= 500);

    if (shouldRetry) {
      config.__retryCount += 1;

      // Exponential backoff: wait longer between each retry
      const delay = Math.min(1000 * Math.pow(2, config.__retryCount - 1), 5000);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return API(config);
    }

    return Promise.reject(error);
  }
);

export default API;
