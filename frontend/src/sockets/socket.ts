// File: frontend/src/sockets/socket.ts
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/useChat';
import { Message } from '../api/messages';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection with authentication
 */
export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Message events
  socket.on('message:received', (data: { message: Message }) => {
    console.log('📨 Message received:', data);
    useChatStore.getState().addMessage(data.message);
    
    // Send delivery confirmation
    socket?.emit('message:delivered', { messageId: data.message._id });
  });

  socket.on('message:sent', (data: { tempId: string; message: Message }) => {
    console.log('✅ Message sent:', data);
    // Replace temporary message with saved message
    useChatStore.getState().addMessage(data.message);
  });

  socket.on('message:delivery-status', (data: { messageId: string; delivered: boolean }) => {
    console.log('📬 Message delivered:', data);
    useChatStore.getState().updateMessage(data.messageId, { delivered: data.delivered });
  });

  socket.on('message:read-status', (data: { messageId: string; read: boolean }) => {
    console.log('👁️ Message read:', data);
    useChatStore.getState().updateMessage(data.messageId, { read: data.read });
  });

  socket.on('message:error', (data: { error: string }) => {
    console.error('❌ Message error:', data.error);
  });

  // Presence events
  socket.on('presence:update', (data: { userId: string; isOnline: boolean }) => {
    console.log('👤 Presence update:', data);
    useChatStore.getState().setUserOnline(data.userId, data.isOnline);
  });

  // Typing events
  socket.on('user:typing', (data: { userId: string }) => {
    useChatStore.getState().setUserTyping(data.userId, true);
    
    // Auto clear typing after 3 seconds
    setTimeout(() => {
      useChatStore.getState().setUserTyping(data.userId, false);
    }, 3000);
  });

  socket.on('user:typing:stop', (data: { userId: string }) => {
    useChatStore.getState().setUserTyping(data.userId, false);
  });

  // Undelivered messages on reconnect
  socket.on('messages:undelivered', (data: { messages: Message[] }) => {
    console.log('📥 Undelivered messages:', data.messages.length);
    data.messages.forEach((message) => {
      useChatStore.getState().addMessage(message);
    });
  });

  return socket;
};

/**
 * Send a message
 */
export const sendMessage = (data: {
  to: string;
  content: string;
  tempId?: string;
  mediaUrl?: string;
  mediaType?: string;
}) => {
  if (socket?.connected) {
    socket.emit('message:send', data);
  } else {
    console.error('Socket not connected');
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = (messageId: string) => {
  if (socket?.connected) {
    socket.emit('message:read', { messageId });
  }
};

/**
 * Send typing indicator
 */
export const sendTyping = (to: string) => {
  if (socket?.connected) {
    socket.emit('typing', { to });
  }
};

/**
 * Stop typing indicator
 */
export const stopTyping = (to: string) => {
  if (socket?.connected) {
    socket.emit('typing:stop', { to });
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;
