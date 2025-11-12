// File: frontend/src/components/ChatWindow.tsx
import React, { useEffect, useRef } from 'react';
import { Message } from '../api/messages';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../stores/useChat';
import { capitalizeWords } from '../utils/string';

interface ChatWindowProps {
  messages: Message[];
  recipientId: string;
  recipientName: string;
  isOnline: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  recipientId, 
  recipientName,
  isOnline 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingUsers } = useChatStore();
  const isTyping = typingUsers[recipientId];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{capitalizeWords(recipientName)}</h3>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                Online
              </span>
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput recipientId={recipientId} />
    </div>
  );
};
