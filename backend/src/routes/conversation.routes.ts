import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as conversationController from '../controllers/conversation.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for the current user
router.get('/', conversationController.getUserConversations);

// Get unread counts for all conversations
router.get('/unread-counts', conversationController.getUnreadCounts);

// Get or create a one-to-one conversation
router.get('/direct/:userId', conversationController.getOrCreateConversation);

// Create a new group
router.post('/groups', conversationController.createGroup);

// Add members to a group
router.post('/groups/:id/members', conversationController.addMembers);

// Remove a member from a group
router.delete('/groups/:id/members/:userId', conversationController.removeMember);

// Update group information
router.patch('/groups/:id', conversationController.updateGroup);

export default router;
