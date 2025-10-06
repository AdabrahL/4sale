// src/api/axios.jsx
import axios from "axios";

const API = axios.create({
  baseURL: "http://backend.test/api", // Laravel API base
});

// Attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("AUTH_TOKEN"); // consistent key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
