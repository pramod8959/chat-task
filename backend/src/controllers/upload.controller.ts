// File: backend/src/controllers/upload.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as uploadService from '../services/upload.service';

/**
 * Get signed URL for file upload
 * POST /api/uploads/signed-url
 * Body: { fileName, fileType, fileSize }
 */
export const getSignedUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    const result = await uploadService.getSignedUploadUrl({
      fileName,
      fileType,
      fileSize,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ error: message });
  }
};
