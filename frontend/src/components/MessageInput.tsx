// File: frontend/src/components/MessageInput.tsx
import React, { useState, useRef } from 'react';
import { sendMessage, sendTyping, stopTyping } from '../sockets/socket';
import { getSignedUploadUrl } from '../api/messages';
import { useChatStore } from '../stores/useChat';
import { useAuthStore } from '../stores/useAuth';

interface MessageInputProps {
  recipientId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ recipientId }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const { user } = useAuthStore();
  const { addMessage } = useChatStore();

  const handleSendMessage = () => {
    if (!message.trim() && !uploadedFile) return;
    if (!user) return;

    const tempId = Date.now().toString();
    const messageContent = message || '📎 Media';

    // Optimistic update - add message to UI immediately
    const optimisticMessage = {
      _id: tempId,
      sender: user.id,
      recipient: recipientId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      delivered: false,
      read: false,
      mediaUrl: uploadedFile?.url,
      mediaType: uploadedFile?.type,
    };

    addMessage(optimisticMessage as any);
    setIsSending(true);

    // Send via socket
    sendMessage({
      to: recipientId,
      content: messageContent,
      tempId,
      mediaUrl: uploadedFile?.url,
      mediaType: uploadedFile?.type,
    });

    setMessage('');
    setUploadedFile(null);
    stopTyping(recipientId);
    
    // Reset sending state after a short delay
    setTimeout(() => setIsSending(false), 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Send typing indicator
    sendTyping(recipientId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(recipientId);
    }, 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Get signed URL
      const { uploadUrl, publicUrl } = await getSignedUploadUrl(
        file.name,
        file.type,
        file.size
      );

      // Upload file directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Set uploaded file info
      const mediaType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'file';

      setUploadedFile({ url: publicUrl, type: mediaType });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {uploadedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700">File uploaded ✓</span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-red-500 text-sm hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          title="Attach file"
        >
          📎
        </button>

        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          disabled={isUploading}
        />

        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && !uploadedFile) || isUploading || isSending}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
