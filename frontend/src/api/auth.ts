// File: frontend/src/api/auth.ts
import { apiClient } from './apiClient';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
  };
  accessToken: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};

/**
 * Get current user
 */
export const getMe = async () => {
  const response = await apiClient.get('/users/me');
  return response.data.user;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  username?: string;
  bio?: string;
  avatar?: string;
}) => {
  const response = await apiClient.patch('/users/me', data);
  return response.data.user;
};
