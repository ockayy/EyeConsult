// src/api/axiosConfig.js

import axios from "axios";

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:10000/api/store", // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally, add interceptors for request/response if needed
// For example, to attach tokens to headers automatically

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("storeToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
