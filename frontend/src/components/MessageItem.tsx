// File: frontend/src/components/MessageItem.tsx
import React from 'react';
import { Message } from '../api/messages';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/useAuth';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { user } = useAuthStore();
  const isSentByMe = message.sender._id === user?.id;

  return (
    <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
        {!isSentByMe && (
          <p className="text-xs text-gray-600 mb-1 px-2">
            {message.sender.username}
          </p>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isSentByMe
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.mediaUrl && (
            <div className="mb-2">
              {message.mediaType === 'image' && (
                <img
                  src={message.mediaUrl}
                  alt="Shared media"
                  className="rounded-lg max-w-full h-auto"
                />
              )}
            </div>
          )}
          
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          <div className="flex items-center justify-end space-x-1 mt-1">
            <p className={`text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
              {format(new Date(message.createdAt), 'HH:mm')}
            </p>
            
            {isSentByMe && (
              <span className="text-xs">
                {message.read ? (
                  <span className="text-blue-100">✓✓</span>
                ) : message.delivered ? (
                  <span className="text-blue-200">✓✓</span>
                ) : (
                  <span className="text-blue-300">✓</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
