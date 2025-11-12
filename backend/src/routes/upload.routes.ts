// File: backend/src/routes/upload.routes.ts
import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';
import { uploadLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

router.post('/signed-url', uploadLimiter, validate(schemas.signedUrl), uploadController.getSignedUrl);

export default router;
