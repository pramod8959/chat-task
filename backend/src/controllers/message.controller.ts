// File: backend/src/controllers/message.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as messageService from '../services/message.service';

/**
 * Get messages for a conversation
 * GET /api/messages/:conversationId
 * Query params: limit, cursor
 */
export const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { limit, cursor } = req.query;

    const messages = await messageService.getMessages({
      conversationId,
      limit: limit ? parseInt(limit as string) : 50,
      cursor: cursor as string,
    });

    res.status(200).json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};

/**
 * Get user conversations
 * GET /api/messages/conversations
 */
export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const conversations = await messageService.getUserConversations(userId);

    res.status(200).json({ conversations });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};
