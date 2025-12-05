// src/api/axios.jsx
import axios from "axios";

const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${backendBase}/api`, 
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

export default API;
