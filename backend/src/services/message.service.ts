// File: backend/src/services/message.service.ts
import { Message, IMessage } from '../models/Message';
import { Conversation, IConversation } from '../models/Conversation';
import { User } from '../models/User';

export interface SendMessageData {
  sender: string;
  recipient: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface MessageQueryParams {
  conversationId: string;
  limit?: number;
  cursor?: string; // Timestamp-based cursor for pagination
}

/**
 * Send a message
 * Creates or finds conversation and persists message
 */
export const sendMessage = async (data: SendMessageData): Promise<IMessage> => {
  const { sender, recipient, content, mediaUrl, mediaType } = data;

  // Validate recipient exists
  const recipientUser = await User.findById(recipient);
  if (!recipientUser) {
    throw new Error('Recipient not found');
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [sender, recipient] },
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [sender, recipient],
    });
    await conversation.save();
  }

  // Create message
  const message = new Message({
    conversationId: conversation._id,
    sender,
    recipient,
    content,
    mediaUrl,
    mediaType,
    delivered: false, // Will be set to true when recipient receives it
    read: false,
  });

  await message.save();

  // Update conversation's last message
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  // Populate sender info
  await message.populate('sender', 'username email avatar');

  return message;
};

/**
 * Get messages for a conversation with cursor-based pagination
 */
export const getMessages = async (params: MessageQueryParams): Promise<IMessage[]> => {
  const { conversationId, limit = 50, cursor } = params;

  // Build query
  const query: Record<string, unknown> = { conversationId };

  // If cursor provided, get messages before that timestamp
  if (cursor) {
    const cursorDate = new Date(cursor);
    query.createdAt = { $lt: cursorDate };
  }

  // Fetch messages with pagination
  const messages = await Message.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .limit(limit)
    .populate('sender', 'username email avatar')
    .populate('recipient', 'username email avatar')
    .lean() as unknown as IMessage[]; // Use lean() for better performance

  return messages.reverse(); // Reverse to show oldest first in UI
};

/**
 * Mark message as delivered
 */
export const markAsDelivered = async (messageId: string): Promise<IMessage | null> => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    {
      delivered: true,
      deliveredAt: new Date(),
    },
    { new: true }
  );

  return message;
};

/**
 * Mark message as read
 */
export const markAsRead = async (messageId: string): Promise<IMessage | null> => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    {
      read: true,
      readAt: new Date(),
    },
    { new: true }
  );

  return message;
};

/**
 * Get undelivered messages for a user
 * Used when user reconnects to deliver pending messages
 */
export const getUndeliveredMessages = async (userId: string): Promise<IMessage[]> => {
  const messages = await Message.find({
    recipient: userId,
    delivered: false,
  })
    .populate('sender', 'username email avatar')
    .lean() as unknown as IMessage[];

  return messages;
};

/**
 * Get user conversations
 */
export const getUserConversations = async (userId: string): Promise<IConversation[]> => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'username email avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .lean() as unknown as IConversation[];

  return conversations;
};
