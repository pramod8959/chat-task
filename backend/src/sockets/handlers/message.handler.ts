// File: backend/src/sockets/handlers/message.handler.ts
import { Socket } from 'socket.io';
import * as messageService from '../../services/message.service';
import { Conversation } from '../../models/Conversation';
import { sendNotification } from '../../queues';
import logger from '../../config/logger';

/**
 * Handle message events
 */
export const handleMessageEvents = (socket: Socket, io: { to: (room: string) => { emit: (event: string, data: unknown) => void } }) => {
  /**
   * Send message event
   * Client emits: { to, conversationId, content, tempId, mediaUrl, mediaType }
   */
  socket.on('message:send', async (data: { to?: string; conversationId?: string; content: string; tempId?: string; mediaUrl?: string; mediaType?: string }) => {
    try {
      const { to, conversationId, content, tempId, mediaUrl, mediaType } = data;
      const sender = (socket as unknown as { userId: string }).userId;

      // Validate data
      if (!content || (!to && !conversationId)) {
        socket.emit('message:error', { error: 'Missing required fields', tempId });
        return;
      }

      const targetConversationId = conversationId;
      let recipients: string[] = [];

      // If conversationId provided, use it (for both 1-to-1 and group chats)
      if (conversationId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('message:error', { error: 'Conversation not found', tempId });
          return;
        }

        // Get all participants except sender
        recipients = conversation.participants
          .map((p) => p.toString())
          .filter((p) => p !== sender);
      } else if (to) {
        // Legacy 1-to-1 support: single recipient
        recipients = [to];
      }

      // Save message to database
      const message = await messageService.sendMessage({
        sender,
        recipient: recipients[0], // For backward compatibility, store first recipient
        conversationId: targetConversationId,
        content,
        mediaUrl,
        mediaType,
      });

      // Emit to sender (acknowledgment with saved message)
      socket.emit('message:sent', {
        tempId,
        message: message.toObject(),
      });

      // Emit to all recipients if online (handles both 1-to-1 and group)
      recipients.forEach((recipientId) => {
        io.to(recipientId).emit('message:received', {
          message: message.toObject(),
        });
      });

      // Send push notifications via BullMQ (background job)
      try {
        for (const recipientId of recipients) {
          await sendNotification({
            userId: recipientId,
            title: `New message from ${sender}`,
            message: content.substring(0, 100),
            type: 'message',
          });
        }
      } catch (error) {
        logger.error('Failed to queue notification:', error);
      }

      logger.debug(`Message sent from ${sender} to ${recipients.join(', ')}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      socket.emit('message:error', { error: message });
    }
  });

  /**
   * Message delivered event
   * Client emits when they receive a message: { messageId }
   */
  socket.on('message:delivered', async (data: { messageId: string }) => {
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
    } catch (error) {
      logger.error('Error marking message as delivered:', error);
    }
  });

  /**
   * Message read event
   * Client emits when they read a message: { messageId }
   */
  socket.on('message:read', async (data: { messageId: string }) => {
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
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  });

  /**
   * Typing indicator
   * Client emits: { to }
   */
  socket.on('typing', (data: { to: string }) => {
    const { to } = data;
    const sender = (socket as unknown as { userId: string }).userId;

    // Notify recipient that sender is typing
    io.to(to).emit('user:typing', { userId: sender });
  });

  /**
   * Stop typing indicator
   * Client emits: { to }
   */
  socket.on('typing:stop', (data: { to: string }) => {
    const { to } = data;
    const sender = (socket as unknown as { userId: string }).userId;

    // Notify recipient that sender stopped typing
    io.to(to).emit('user:typing:stop', { userId: sender });
  });
};
