// File: frontend/src/pages/Chat.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuth';
import { useChatStore } from '../stores/useChat';
import { initializeSocket, disconnectSocket } from '../sockets/socket';
import { getMessages, getUsers } from '../api/messages';
import { getUserConversations, getUnreadCounts } from '../api/conversations';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { ProfileModal } from '../components/ProfileModal';
import GroupChatModal from '../components/GroupChatModal';
import GroupDetailsModal from '../components/GroupDetailsModal';
import { capitalizeWords } from '../utils/string';

interface User {
  _id: string;
  username: string;
  email: string;
  isOnline?: boolean;
}

export const Chat: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { 
    conversations, 
    messages, 
    activeConversationId, 
    onlineUsers,
    setConversations, 
    setMessages, 
    setActiveConversation,
    clearChat 
  } = useChatStore();
  
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [conversationId: string]: number }>({});
  const navigate = useNavigate();

  const loadConversations = useCallback(async () => {
    try {
      const data = await getUserConversations();
      // Transform the data to match the expected type
      const transformedData = data.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) => ({
          _id: p._id,
          username: p.username,
          email: p.email || '',
          avatar: p.avatar,
          isOnline: p.isOnline || false,
          lastSeen: p.lastSeen || new Date().toISOString(),
        })),
      }));
      setConversations(transformedData as any);
      
      // Load unread counts
      const counts = await getUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [setConversations]);

  const loadUsers = useCallback(async () => {
    try {
      const users = await getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  // Initialize socket and load data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        initializeSocket(token);
      }

      await loadConversations();
      await loadUsers();
    };

    loadData();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, navigate, loadConversations, loadUsers]);

  const handleSelectConversation = async (conversationId: string, recipientId: string) => {
    setActiveConversation(conversationId);
    setSelectedRecipientId(recipientId);
    setShowUserList(false);

    // Load messages for this conversation
    try {
      const msgs = await getMessages(conversationId);
      setMessages(conversationId, msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSelectUser = (userId: string) => {
    // Check if conversation exists
    const existingConversation = conversations.find((conv) =>
      conv.participants.some((p) => p._id === userId)
    );

    if (existingConversation) {
      handleSelectConversation(existingConversation._id, userId);
    } else {
      // Start new conversation
      setSelectedRecipientId(userId);
      setActiveConversation(null);
      setShowUserList(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    clearChat();
    disconnectSocket();
    navigate('/login');
  };

  const getRecipientInfo = () => {
    if (!selectedRecipientId) return null;

    // Check if it's a group chat (selectedRecipientId === conversationId for groups)
    const groupConversation = conversations.find((conv) => 
      conv.isGroup && (conv._id === selectedRecipientId || conv._id === activeConversationId)
    );
    
    if (groupConversation) {
      return {
        name: groupConversation.groupName || 'Group Chat',
        isOnline: false, // Groups don't have online status
        isGroup: true,
      };
    }

    // Try to find in conversations first (for 1-to-1)
    for (const conv of conversations) {
      if (conv.isGroup) continue; // Skip groups
      const recipient = conv.participants.find((p) => p._id === selectedRecipientId);
      if (recipient) {
        return {
          name: recipient.username,
          isOnline: onlineUsers.has(recipient._id),
          isGroup: false,
        };
      }
    }

    // Fall back to all users list
    const user = allUsers.find((u) => u._id === selectedRecipientId);
    return user ? {
      name: user.username,
      isOnline: onlineUsers.has(user._id),
      isGroup: false,
    } : null;
  };

  const recipientInfo = getRecipientInfo();
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Chat App</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold">{capitalizeWords(user?.username || '')}</span>
          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
          >
            Profile
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
          >
            New Group
          </button>
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
          >
            New Chat
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        <ChatList 
          conversations={conversations}
          unreadCounts={unreadCounts}
          onSelectConversation={handleSelectConversation}
        />

        {selectedRecipientId && recipientInfo ? (
          <ChatWindow
            messages={activeMessages}
            recipientId={selectedRecipientId}
            recipientName={recipientInfo.name}
            isOnline={recipientInfo.isOnline}
            isGroup={recipientInfo.isGroup}
            onGroupInfoClick={recipientInfo.isGroup ? () => setShowGroupDetails(true) : undefined}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">👋 Welcome to Chat!</p>
              <p>Select a conversation or start a new chat</p>
            </div>
          </div>
        )}
      </div>

      {/* User List Modal */}
      {showUserList && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select a user</h2>
              <button
                onClick={() => setShowUserList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {allUsers.map((usr) => (
                <div
                  key={usr._id}
                  onClick={() => handleSelectUser(usr._id)}
                  className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {usr.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{capitalizeWords(usr.username)}</p>
                    <p className="text-sm text-gray-500">{usr.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* Group Chat Modal */}
      <GroupChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={loadConversations}
      />

      {/* Group Details Modal */}
      <GroupDetailsModal
        isOpen={showGroupDetails}
        onClose={() => setShowGroupDetails(false)}
        conversation={activeConversation || null}
        onUpdate={loadConversations}
      />
    </div>
  );
};
