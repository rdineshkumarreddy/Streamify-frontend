// src/api/axiosInstance.js

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("Response error:", {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token...");

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data;

        console.log("Token refresh successful");

        localStorage.setItem("token", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);

      } catch (error) {

        console.error("Refresh token failed:", error);

        localStorage.removeItem("token");

        window.location.href = "/login";

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { api as axiosInstance };