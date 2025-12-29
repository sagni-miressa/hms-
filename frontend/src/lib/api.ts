/**
 * API Client
 * Axios instance with security interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] =
      `web-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Token expired - try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Update tokens
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - logout
        useAuthStore.getState().logout();
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.error?.message || "An error occurred";
    const errorCode = error.response?.data?.error?.code;

    // Don't show toast for certain errors (let component handle)
    const silentErrors = [
      "VALIDATION_ERROR",
      "RESOURCE_NOT_FOUND",
      "INVALID_CREDENTIALS",
      "TOKEN_EXPIRED",
    ];
    if (!errorCode || !silentErrors.includes(errorCode)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    timestamp: string;
    requestId: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract data from API response
 */
export const extractData = <T>(response: { data: ApiResponse<T> }): T => {
  return response.data.data as T;
};

/**
 * Extract pagination from API response
 */
export const extractPagination = (response: { data: ApiResponse }) => {
  return response.data.meta?.pagination;
};

export default api;
