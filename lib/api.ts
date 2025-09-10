import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create Axios instance with base URL from environment variable
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api",
});

// Request interceptor to add Bearer token from localStorage
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error?.message || "Request failed";
    console.error("API error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
