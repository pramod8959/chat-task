// File: backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, config.jwtSecret as string, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, config.jwtRefreshSecret as string, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate both tokens
 */
export const generateTokens = (user: IUser) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
