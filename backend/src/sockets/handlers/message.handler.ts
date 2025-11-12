// File: backend/src/sockets/handlers/message.handler.ts
import { Socket } from 'socket.io';
import * as messageService from '../../services/message.service';
import { sendNotification } from '../../queues';
import logger from '../../config/logger';

/**
 * Handle message events
 */
export const handleMessageEvents = (socket: Socket, io: any) => {
  /**
   * Send message event
   * Client emits: { to, content, tempId, mediaUrl, mediaType }
   */
  socket.on('message:send', async (data: any) => {
    try {
      const { to, content, tempId, mediaUrl, mediaType } = data;
      const sender = (socket as any).userId;

      // Validate data
      if (!to || !content) {
        socket.emit('message:error', { error: 'Missing required fields', tempId });
        return;
      }

      // Save message to database
      const message = await messageService.sendMessage({
        sender,
        recipient: to,
        content,
        mediaUrl,
        mediaType,
      });

      // Emit to sender (acknowledgment with saved message)
      socket.emit('message:sent', {
        tempId,
        message: message.toObject(),
      });

      // Emit to recipient if online
      io.to(to).emit('message:received', {
        message: message.toObject(),
      });

      // Send push notification via BullMQ (background job)
      try {
        await sendNotification({
          userId: to,
          title: `New message from ${sender}`,
          message: content.substring(0, 100),
          type: 'message',
        });
      } catch (error) {
        logger.error('Failed to queue notification:', error);
      }

      logger.debug(`Message sent from ${sender} to ${to}`);
    } catch (error: any) {
      logger.error('Error sending message:', error);
      socket.emit('message:error', { error: error.message });
    }
  });

  /**
   * Message delivered event
   * Client emits when they receive a message: { messageId }
   */
  socket.on('message:delivered', async (data: any) => {
    try {
      const { messageId } = data;

      // Mark message as delivered
      const message = await messageService.markAsDelivered(messageId);

      if (message) {
        // Notify sender that message was delivered
        io.to(message.sender.toString()).emit('message:delivery-status', {
          messageId,
          delivered: true,
          deliveredAt: message.deliveredAt,
        });
      }
    } catch (error: any) {
      logger.error('Error marking message as delivered:', error);
    }
  });

  /**
   * Message read event
   * Client emits when they read a message: { messageId }
   */
  socket.on('message:read', async (data: any) => {
    try {
      const { messageId } = data;

      // Mark message as read
      const message = await messageService.markAsRead(messageId);

      if (message) {
        // Notify sender that message was read
        io.to(message.sender.toString()).emit('message:read-status', {
          messageId,
          read: true,
          readAt: message.readAt,
        });
      }
    } catch (error: any) {
      logger.error('Error marking message as read:', error);
    }
  });

  /**
   * Typing indicator
   * Client emits: { to }
   */
  socket.on('typing', (data: any) => {
    const { to } = data;
    const sender = (socket as any).userId;

    // Notify recipient that sender is typing
    io.to(to).emit('user:typing', { userId: sender });
  });

  /**
   * Stop typing indicator
   * Client emits: { to }
   */
  socket.on('typing:stop', (data: any) => {
    const { to } = data;
    const sender = (socket as any).userId;

    // Notify recipient that sender stopped typing
    io.to(to).emit('user:typing:stop', { userId: sender });
  });
};
