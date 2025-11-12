// File: backend/src/services/auth.service.ts
import { User, IUser } from '../models/User';
import { generateTokens } from '../utils/jwt';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterData): Promise<{ user: IUser; tokens: any }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Create new user
  const user = new User({
    email: data.email,
    password: data.password,
    username: data.username,
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokens(user);

  // Store refresh token
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return { user, tokens };
};

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<{ user: IUser; tokens: any }> => {
  // Find user by email
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Store refresh token
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return { user, tokens };
};

/**
 * Logout user - remove refresh token
 */
export const logoutUser = async (userId: string, refreshToken: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Remove refresh token
  user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
  await user.save();
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  // Find user with this refresh token
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) {
    throw new Error('Invalid refresh token');
  }

  // Generate new access token
  const tokens = generateTokens(user);

  return { accessToken: tokens.accessToken };
};
