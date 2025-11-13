import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    email?: string;
    avatar?: string;
    status?: string;
    isOnline?: boolean;
    lastSeen?: string;
  }>;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: string;
  lastMessage?: {
    _id?: string;
    content: string;
    createdAt: string;
  };
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  participantIds: string[];
  groupName: string;
  groupAvatar?: string;
}

export interface UpdateGroupData {
  groupName?: string;
  groupAvatar?: string;
}

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/conversations');
  return response.data;
};

/**
 * Get or create a one-to-one conversation
 */
export const getOrCreateConversation = async (userId: string): Promise<Conversation> => {
  const response = await api.get(`/conversations/direct/${userId}`);
  return response.data;
};

/**
 * Create a new group conversation
 */
export const createGroup = async (data: CreateGroupData): Promise<Conversation> => {
  const response = await api.post('/conversations/groups', data);
  return response.data;
};

/**
 * Add members to a group
 */
export const addGroupMembers = async (
  conversationId: string,
  memberIds: string[]
): Promise<Conversation> => {
  const response = await api.post(`/conversations/groups/${conversationId}/members`, {
    memberIds,
  });
  return response.data;
};

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (
  conversationId: string,
  userId: string
): Promise<Conversation> => {
  const response = await api.delete(
    `/conversations/groups/${conversationId}/members/${userId}`
  );
  return response.data;
};

/**
 * Update group information
 */
export const updateGroup = async (
  conversationId: string,
  data: UpdateGroupData
): Promise<Conversation> => {
  const response = await api.patch(`/conversations/groups/${conversationId}`, data);
  return response.data;
};

/**
 * Get unread counts for all conversations
 */
export const getUnreadCounts = async (): Promise<{ [conversationId: string]: number }> => {
  const response = await api.get('/conversations/unread-counts');
  return response.data;
};
