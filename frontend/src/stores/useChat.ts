// File: frontend/src/stores/useChat.ts
import { create } from 'zustand';
import { Message, Conversation } from '../api/messages';

interface ChatStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  typingUsers: Record<string, boolean>;
  
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  onlineUsers: new Set(),
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (message) =>
    set((state) => {
      const conversationId = message.conversationId;
      const existingMessages = state.messages[conversationId] || [];
      
      // Check if message already exists (avoid duplicates)
      if (existingMessages.some((m) => m._id === message._id)) {
        return state;
      }

      // Update the conversation's lastMessage and lastMessageAt
      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          };
        }
        return conv;
      });

      // Sort conversations by lastMessageAt (most recent first)
      updatedConversations.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });

      return {
        conversations: updatedConversations,
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      const newMessages = { ...state.messages };
      
      Object.keys(newMessages).forEach((conversationId) => {
        newMessages[conversationId] = newMessages[conversationId].map((msg) =>
          msg._id === messageId ? { ...msg, ...updates } : msg
        );
      });

      return { messages: newMessages };
    }),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    }),

  setUserTyping: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),

  clearChat: () =>
    set({
      conversations: [],
      messages: {},
      activeConversationId: null,
      onlineUsers: new Set(),
      typingUsers: {},
    }),
}));
