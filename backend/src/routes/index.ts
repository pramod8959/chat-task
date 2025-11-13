// File: backend/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import messageRoutes from './message.routes';
import uploadRoutes from './upload.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', uploadRoutes);
router.use('/conversations', conversationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
