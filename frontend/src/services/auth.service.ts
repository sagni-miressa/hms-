/**
 * Authentication Service
 * API calls for authentication
 */

import { api, extractData, ApiResponse } from "@/lib/api";
import type { User } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  mfaToken?: string;
  deviceId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresMFA: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  recaptchaToken?: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Login user
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    data
  );
  return extractData(response);
};

/**
 * Register new user
 */
export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    data
  );
  return extractData(response);
};

/**
 * Logout user
 */
export const logout = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
  return extractData(response);
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/refresh", {
    refreshToken,
  });
  return extractData(response);
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.post("/auth/password/change", {
    currentPassword,
    newPassword,
  });
};

/**
 * Verify email with code
 */
export const verifyEmail = async (data: {
  code: string;
  email: string;
}): Promise<{ message: string }> => {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/verify-email",
    data
  );
  return extractData(response);
};

/**
 * Resend verification email
 */
export const resendVerification = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/resend-verification",
    { email }
  );
  return extractData(response);
};

/**
 * Request password reset (forgot password)
 */
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/password/forgot",
    { email }
  );
  return extractData(response);
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: {
  token: string;
  email: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/password/reset",
    data
  );
  return extractData(response);
};
