// File: frontend/src/components/ChatList.tsx
import React from 'react';
import { Conversation } from '../api/messages';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../stores/useAuth';
import { useChatStore } from '../stores/useChat';
import { capitalizeWords } from '../utils/string';

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string, recipientId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ conversations, onSelectConversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, onlineUsers } = useChatStore();

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== user?.id);
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isActive = activeConversationId === conversation._id;
          const isOnline = otherUser && onlineUsers.has(otherUser._id);

          return (
            <div
              key={conversation._id}
              onClick={() => otherUser && onSelectConversation(conversation._id, otherUser._id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {otherUser?.username.charAt(0).toUpperCase()}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {capitalizeWords(otherUser?.username || '')}
                    </p>
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {conversations.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm mt-2">Start chatting with someone!</p>
        </div>
      )}
    </div>
  );
};
