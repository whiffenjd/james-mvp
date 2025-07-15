import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { randomUUID } from 'crypto';
import { Express } from 'express';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const s3Upload = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('S3 bucket name is not configured in environment variables');
  }

  const key = `${randomUUID()}-${file.originalname.replace(/\s+/g, '_')}`;
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Generate a signed URL (optional, expires in 1 hour)
    const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand(params), {
      expiresIn: 3600,
    });
    return signedUrl; // Return signed URL; use s3Client.config.endpoint?.href + key for permanent URL if needed
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error('Failed to upload file to S3');
  }
};
