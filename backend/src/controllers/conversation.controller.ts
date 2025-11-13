import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as conversationService from '../services/conversation.service';
import * as messageService from '../services/message.service';

/**
 * Create a new group conversation
 */
export const createGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { participantIds, groupName, groupAvatar } = req.body;
    const adminId = req.user!.userId;

    if (!participantIds || !Array.isArray(participantIds)) {
      res.status(400).json({ error: 'participantIds must be an array' });
      return;
    }

    if (!groupName) {
      res.status(400).json({ error: 'groupName is required' });
      return;
    }

    const conversation = await conversationService.createGroupConversation(
      adminId,
      participantIds,
      groupName,
      groupAvatar
    );

    await conversation.populate('participants', 'username avatar status');

    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Add members to a group
 */
export const addMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;
    const requesterId = req.user!.userId;

    if (!memberIds || !Array.isArray(memberIds)) {
      res.status(400).json({ error: 'memberIds must be an array' });
      return;
    }

    const conversation = await conversationService.addGroupMembers(
      id,
      requesterId,
      memberIds
    );

    await conversation.populate('participants', 'username avatar status');

    res.json(conversation);
  } catch (error: any) {
    console.error('Error adding members:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Remove a member from a group
 */
export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const requesterId = req.user!.userId;

    const conversation = await conversationService.removeGroupMember(
      id,
      requesterId,
      userId
    );

    await conversation.populate('participants', 'username avatar status');

    res.json(conversation);
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update group information
 */
export const updateGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { groupName, groupAvatar } = req.body;
    const requesterId = req.user!.userId;

    const conversation = await conversationService.updateGroupInfo(
      id,
      requesterId,
      { groupName, groupAvatar }
    );

    await conversation.populate('participants', 'username avatar status');

    res.json(conversation);
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const conversations = await conversationService.getUserConversations(userId);

    res.json(conversations);
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get or create a one-to-one conversation
 */
export const getOrCreateConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.userId;

    if (userId === currentUserId) {
      res.status(400).json({ error: 'Cannot create conversation with yourself' });
      return;
    }

    const conversation = await conversationService.getOrCreateConversation(
      currentUserId,
      userId
    );

    await conversation.populate('participants', 'username avatar status');

    res.json(conversation);
  } catch (error: any) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get unread counts for all conversations
 */
export const getUnreadCounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const unreadCounts = await messageService.getUnreadCounts(userId);

    res.json(unreadCounts);
  } catch (error: any) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({ error: error.message });
  }
};
