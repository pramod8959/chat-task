// File: frontend/src/api/messages.ts
import { apiClient } from './apiClient';

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  delivered: boolean;
  read: boolean;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: string;
  }>;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: string;
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  params?: { limit?: number; cursor?: string }
): Promise<Message[]> => {
  const response = await apiClient.get(`/messages/${conversationId}`, { params });
  return response.data.messages;
};

/**
 * Get user conversations
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await apiClient.get('/messages/conversations');
  return response.data.conversations;
};

/**
 * Get all users (for contact list)
 */
export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data.users;
};

/**
 * Get signed URL for file upload
 */
export const getSignedUploadUrl = async (
  fileName: string,
  fileType: string,
  fileSize: number
) => {
  const response = await apiClient.post('/uploads/signed-url', {
    fileName,
    fileType,
    fileSize,
  });
  return response.data;
};
