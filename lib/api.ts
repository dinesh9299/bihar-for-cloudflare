// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// const api: AxiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://183.82.117.36:1339/api",
// });

// // Request interceptor to add Bearer token and check expiration
// api.interceptors.request.use((config: AxiosRequestConfig) => {
//   const token = localStorage.getItem("token");
//   const expirationTime = localStorage.getItem("tokenExpiration");

//   if (token && expirationTime) {
//     const currentTime = Date.now();
//     if (currentTime > parseInt(expirationTime)) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("tokenExpiration");
//       if (typeof window !== "undefined") {
//         window.location.href = "/"; // Fallback for non-React context
//       }
//       throw new Error("Session expired. Please log in again.");
//     }
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor for centralized error handling
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   (error) => {
//     const errorMessage =
//       error.response?.data?.error?.message || error.message || "Request failed";

//     // Log detailed error for debugging
//     console.error("API Error Details:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: errorMessage,
//       url: error.config?.url,
//     });

//     // Handle 401 Unauthorized (expired or invalid token)
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("tokenExpiration");
//       if (typeof window !== "undefined") {
//         window.location.href = "/"; // Fallback for non-React context
//       }
//       return Promise.reject(new Error("Session expired. Please log in again."));
//     }

//     return Promise.reject(new Error(errorMessage));
//   }
// );

// export default api;

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://183.82.117.36:1339/api",
});

// ✅ Request interceptor to add Bearer token and check expiration
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  const expirationTime = localStorage.getItem("tokenExpiration");

  if (token && expirationTime) {
    const currentTime = Date.now();

    // If token expired → remove and redirect
    if (currentTime > parseInt(expirationTime)) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");

      if (typeof window !== "undefined") {
        window.location.href = "/"; // Redirect to login
      }

      throw new Error("Session expired. Please log in again.");
    }

    // Attach Bearer token
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error?.message || error.message || "Request failed";

    // Log detailed error for debugging
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
      url: error.config?.url,
    });

    // Handle 401 Unauthorized (expired or invalid token)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");

      if (typeof window !== "undefined") {
        window.location.href = "/"; // Redirect to login
      }

      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// const api: AxiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://183.82.117.36:1339/api",
// });

// // ✅ Request interceptor — attach token only (don’t force logout by time)
// api.interceptors.request.use((config: AxiosRequestConfig) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// // ✅ Response interceptor for centralized error handling
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   (error) => {
//     const errorMessage =
//       error.response?.data?.error?.message || error.message || "Request failed";

//     console.error("API Error Details:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: errorMessage,
//       url: error.config?.url,
//     });

//     // Handle 401 Unauthorized (token expired/invalid)
//     // if (error.response?.status === 401) {
//     //   console.warn("🚫 Unauthorized: clearing session");
//     //   localStorage.removeItem("token");
//     //   localStorage.removeItem("tokenExpiration");
//     //   if (typeof window !== "undefined") {
//     //     window.location.href = "/";
//     //   }
//     // }

//     return Promise.reject(error);
//   }
// );

// export default api;
