// File: backend/src/utils/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import crypto from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface SignedUploadUrlParams {
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface SignedUploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/**
 * Generate a signed URL for direct S3 upload
 * Client uploads directly to S3 using this URL
 * 
 * CORS Configuration Required on S3 Bucket:
 * {
 *   "AllowedHeaders": ["*"],
 *   "AllowedMethods": ["PUT", "POST", "GET"],
 *   "AllowedOrigins": ["http://localhost:5173", "your-production-domain.com"],
 *   "ExposeHeaders": ["ETag"]
 * }
 */
export const generateSignedUploadUrl = async (
  params: SignedUploadUrlParams
): Promise<SignedUploadUrlResponse> => {
  // Generate unique key for the file
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = params.fileName.split('.').pop();
  const key = `uploads/${timestamp}-${randomString}.${extension}`;

  // Create PUT command for S3
  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    ContentType: params.fileType,
  });

  // Generate signed URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  // Public URL for accessing the uploaded file
  const publicUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
};

/**
 * Validate file size and type
 */
export const validateFileUpload = (
  fileType: string,
  fileSize: number
): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
  ];

  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};
