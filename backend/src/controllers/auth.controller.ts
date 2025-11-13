// File: backend/src/controllers/auth.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as authService from '../services/auth.service';
import { verifyRefreshToken } from '../utils/jwt';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    const { user, tokens } = await authService.registerUser({
      email,
      password,
      username,
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { user, tokens } = await authService.loginUser({ email, password });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(401).json({ error: message });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token not found' });
      return;
    }

    // Verify refresh token
    verifyRefreshToken(refreshToken);

    // Generate new access token and get user info
    const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({ 
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(401).json({ error: message });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?.userId;

    if (refreshToken && userId) {
      await authService.logoutUser(userId, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};
