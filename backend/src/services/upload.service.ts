// File: backend/src/services/upload.service.ts
import { generateSignedUploadUrl, validateFileUpload, SignedUploadUrlParams } from '../utils/s3';

/**
 * Get signed URL for file upload
 */
export const getSignedUploadUrl = async (params: SignedUploadUrlParams) => {
  const { fileName, fileType, fileSize } = params;

  // Validate file
  if (fileSize) {
    const validation = validateFileUpload(fileType, fileSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  // Generate signed URL
  const result = await generateSignedUploadUrl({
    fileName,
    fileType,
    fileSize,
  });

  return result;
};
