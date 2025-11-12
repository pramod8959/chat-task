// File: backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate JWT token from Authorization header
 * Usage: Apply to protected routes
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Socket authentication middleware
 * Validates JWT during Socket.IO handshake
 */
export const authenticateSocket = (socket: any, next: any) => {
  try {
    // Token can be sent via query params or auth object
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = verifyAccessToken(token as string);

    // Attach user to socket
    socket.userId = decoded.userId;
    socket.email = decoded.email;

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
