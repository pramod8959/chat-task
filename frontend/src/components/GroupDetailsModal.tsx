import React, { useState, useEffect } from 'react';
import { removeGroupMember, updateGroup, addGroupMembers, Conversation } from '../api/conversations';
import { getUsers } from '../api/messages';
import { useAuthStore } from '../stores/useAuth';

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onUpdate: () => void;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onUpdate,
}) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ _id: string; username: string; email: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{ _id: string; username: string; email: string }>>([]);

  useEffect(() => {
    if (isOpen && showAddMembers) {
      loadUsers();
    }
  }, [isOpen, showAddMembers]);

  const loadUsers = async () => {
    try {
      const users = await getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter out current members and search
    const currentMemberIds = conversation?.participants.map(p => p._id) || [];
    const filtered = allUsers.filter(
      (u) =>
        !currentMemberIds.includes(u._id) &&
        (u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to add');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await addGroupMembers(conversation!._id, selectedUsers);
      setShowAddMembers(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response && 'data' in err.response && typeof err.response.data === 'object' && err.response.data && 'error' in err.response.data ? String(err.response.data.error) : 'Failed to add members');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !conversation || !conversation.isGroup) return null;

  const isAdmin = conversation.groupAdmin === user?.id;
  const currentGroupName = conversation.groupName || 'Unnamed Group';

  const handleUpdateName = async () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateGroup(conversation._id, { groupName: groupName.trim() });
      setIsEditing(false);
      setGroupName('');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response && 'data' in err.response && typeof err.response.data === 'object' && err.response.data && 'error' in err.response.data ? String(err.response.data.error) : 'Failed to update group name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await removeGroupMember(conversation._id, userId);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response && 'data' in err.response && typeof err.response.data === 'object' && err.response.data && 'error' in err.response.data ? String(err.response.data.error) : 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setGroupName(currentGroupName);
    setIsEditing(true);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Group Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Group Name */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 font-medium">Group Name</label>
            {isAdmin && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateName}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setGroupName('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-lg font-semibold text-gray-900">{currentGroupName}</p>
          )}
        </div>

        {/* Members List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              Members ({conversation.participants.length})
            </h3>
            {isAdmin && !showAddMembers && (
              <button
                onClick={() => setShowAddMembers(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                + Add Members
              </button>
            )}
          </div>

          {/* Add Members Section */}
          {showAddMembers && isAdmin && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Add New Members</h4>
                <button
                  onClick={() => {
                    setShowAddMembers(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSelectedUsers([]);
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto mb-3 space-y-1">
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => toggleUserSelection(u._id)}
                      className={`p-2 rounded cursor-pointer transition ${
                        selectedUsers.includes(u._id)
                          ? 'bg-blue-200'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected: {selectedUsers.length} user(s)
                  </p>
                  <button
                    onClick={handleAddMembers}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Adding...' : `Add ${selectedUsers.length} Member(s)`}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">{conversation.participants.map((participant) => {
              const isSelf = participant._id === user?.id;
              const isGroupAdmin = participant._id === conversation.groupAdmin;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {participant.username}
                        {isSelf && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                      {isGroupAdmin && (
                        <span className="text-xs text-blue-600 font-medium">Admin</span>
                      )}
                      {participant.isOnline && (
                        <span className="text-xs text-green-600">● Online</span>
                      )}
                    </div>
                  </div>

                  {/* Remove button - only show if user is admin and target is not admin */}
                  {isAdmin && !isGroupAdmin && !isSelf && (
                    <button
                      onClick={() => handleRemoveMember(participant._id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Info */}
        {!isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Only the group admin can edit group settings and manage members.
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsModal;
