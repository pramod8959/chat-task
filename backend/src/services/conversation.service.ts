import { Conversation, IConversation } from '../models/Conversation';
import { User } from '../models/User';
import mongoose from 'mongoose';

/**
 * Create a new group conversation
 */
export const createGroupConversation = async (
  adminId: string,
  participantIds: string[],
  groupName: string,
  groupAvatar?: string
): Promise<IConversation> => {
  // Ensure admin is included in participants
  const allParticipants = Array.from(new Set([adminId, ...participantIds]));

  if (allParticipants.length < 2) {
    throw new Error('Group must have at least 2 participants');
  }

  // Verify all participants exist
  const users = await User.find({ _id: { $in: allParticipants } });
  if (users.length !== allParticipants.length) {
    throw new Error('One or more participants not found');
  }

  const conversation = await Conversation.create({
    participants: allParticipants,
    isGroup: true,
    groupName,
    groupAvatar,
    groupAdmin: adminId,
  });

  return conversation;
};

/**
 * Add members to a group conversation
 */
export const addGroupMembers = async (
  conversationId: string,
  requesterId: string,
  memberIds: string[]
): Promise<IConversation> => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!conversation.isGroup) {
    throw new Error('Can only add members to group conversations');
  }

  // Only group admin can add members
  if (conversation.groupAdmin?.toString() !== requesterId) {
    throw new Error('Only group admin can add members');
  }

  // Verify all new members exist
  const users = await User.find({ _id: { $in: memberIds } });
  if (users.length !== memberIds.length) {
    throw new Error('One or more users not found');
  }

  // Add new members (avoiding duplicates)
  const participantIds = conversation.participants.map((p) => p.toString());
  const newMembers = memberIds.filter((id) => !participantIds.includes(id));

  conversation.participants.push(
    ...newMembers.map((id) => new mongoose.Types.ObjectId(id))
  );
  await conversation.save();

  return conversation;
};

/**
 * Remove a member from a group conversation
 */
export const removeGroupMember = async (
  conversationId: string,
  requesterId: string,
  memberId: string
): Promise<IConversation> => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!conversation.isGroup) {
    throw new Error('Can only remove members from group conversations');
  }

  // Only group admin can remove members (or users can remove themselves)
  if (
    conversation.groupAdmin?.toString() !== requesterId &&
    memberId !== requesterId
  ) {
    throw new Error('Only group admin can remove members');
  }

  // Cannot remove the admin
  if (memberId === conversation.groupAdmin?.toString()) {
    throw new Error('Cannot remove group admin');
  }

  conversation.participants = conversation.participants.filter(
    (p) => p.toString() !== memberId
  );

  await conversation.save();

  return conversation;
};

/**
 * Update group information (name, avatar)
 */
export const updateGroupInfo = async (
  conversationId: string,
  requesterId: string,
  updates: { groupName?: string; groupAvatar?: string }
): Promise<IConversation> => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!conversation.isGroup) {
    throw new Error('Can only update group conversations');
  }

  // Only group admin can update group info
  if (conversation.groupAdmin?.toString() !== requesterId) {
    throw new Error('Only group admin can update group information');
  }

  if (updates.groupName) {
    conversation.groupName = updates.groupName;
  }

  if (updates.groupAvatar !== undefined) {
    conversation.groupAvatar = updates.groupAvatar;
  }

  await conversation.save();

  return conversation;
};

/**
 * Get or create a one-to-one conversation between two users
 */
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<IConversation> => {
  // Find existing conversation
  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [userId1, userId2], $size: 2 },
  });

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId1, userId2],
      isGroup: false,
    });
  }

  return conversation;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (
  userId: string
): Promise<IConversation[]> => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'username avatar status')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  return conversations;
};
