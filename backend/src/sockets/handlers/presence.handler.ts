// File: backend/src/sockets/handlers/presence.handler.ts
import { Socket } from 'socket.io';
import { User } from '../../models/User';
import { presenceService } from '../../services/socket.service';
import * as messageService from '../../services/message.service';
import logger from '../../config/logger';

/**
 * Handle presence events (online/offline status)
 */
export const handlePresenceEvents = (socket: Socket) => {
  const userId = (socket as unknown as { userId: string }).userId;

  /**
   * User connected - set online status
   */
  const handleConnect = async () => {
    try {
      // Update user status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Track presence in Redis
      await presenceService.setOnline(userId, socket.id);

      // Join user's personal room for targeted messages
      socket.join(userId);

      // Broadcast to other users that this user is online
      socket.broadcast.emit('presence:update', {
        userId,
        isOnline: true,
      });

      // Deliver any undelivered messages
      const undeliveredMessages = await messageService.getUndeliveredMessages(userId);
      if (undeliveredMessages.length > 0) {
        socket.emit('messages:undelivered', { messages: undeliveredMessages });

        // Mark messages as delivered
        for (const msg of undeliveredMessages) {
          await messageService.markAsDelivered(msg._id.toString());
        }
      }

      logger.info(`User ${userId} connected`);
    } catch (error) {
      logger.error('Error handling user connection:', error);
    }
  };

  /**
   * User disconnected - set offline status
   */
  const handleDisconnect = async () => {
    try {
      // Update user status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Remove from Redis presence
      await presenceService.setOffline(userId);

      // Broadcast to other users that this user is offline
      socket.broadcast.emit('presence:update', {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });

      logger.info(`User ${userId} disconnected`);
    } catch (error) {
      logger.error('Error handling user disconnection:', error);
    }
  };

  // Execute on connection
  handleConnect();

  // Listen for disconnect
  socket.on('disconnect', handleDisconnect);

  /**
   * Manual presence update
   * Client can explicitly set their presence status
   */
  socket.on('presence:set', async (data: { status: string }) => {
    try {
      const { status } = data; // 'online', 'away', 'busy', etc.

      await User.findByIdAndUpdate(userId, {
        isOnline: status === 'online',
        lastSeen: new Date(),
      });

      socket.broadcast.emit('presence:update', {
        userId,
        isOnline: status === 'online',
        status,
      });
    } catch (error) {
      logger.error('Error updating presence:', error);
    }
  });
};
