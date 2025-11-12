// File: backend/src/controllers/user.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { User } from '../models/User';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId)
      .select('-password -refreshTokens')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};

/**
 * Get all users (for contact list)
 * GET /api/users
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;

    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username email avatar isOnline lastSeen')
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};

/**
 * Update user profile
 * PATCH /api/users/me
 */
export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { username, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, avatar },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.status(200).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};
