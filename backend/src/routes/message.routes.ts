// File: backend/src/routes/message.routes.ts
import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';

const router = Router();

// All message routes require authentication
router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', validate(schemas.pagination, 'query'), messageController.getMessages);

export default router;
