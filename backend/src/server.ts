// File: backend/src/server.ts
import http from 'http';
import app from './app';
import { config } from './config';
import { connectDB } from './utils/db';
import { initializeSocket } from './sockets';
import logger from './config/logger';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start listening
    httpServer.listen(config.port, () => {
      logger.info(`
        🚀 Server is running!
        📡 API: http://localhost:${config.port}/api
        🔌 Socket.IO: http://localhost:${config.port}
        🌍 Environment: ${config.nodeEnv}
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      httpServer.close(() => {
        logger.info('HTTP server closed');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
