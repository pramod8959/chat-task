// File: backend/src/sockets/index.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';
import { authenticateSocket } from '../middlewares/auth.middleware';
import { handleMessageEvents } from './handlers/message.handler';
import { handlePresenceEvents } from './handlers/presence.handler';
import { setupRedisAdapter } from '../services/socket.service';
import logger from '../config/logger';

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Setup Redis adapter for horizontal scaling
  // Comment out in development if Redis is not available
  if (config.nodeEnv === 'production') {
    setupRedisAdapter(io);
  }

  // Authentication middleware
  io.use(authenticateSocket);

  // Handle connections
  io.on('connection', (socket) => {
    const userId = (socket as unknown as { userId: string }).userId;
    logger.info(`Socket connected: ${socket.id} for user ${userId}`);

    // Register event handlers
    handlePresenceEvents(socket);
    handleMessageEvents(socket, io);

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.info('Socket.IO server initialized');

  return io;
};
