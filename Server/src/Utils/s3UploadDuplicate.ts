import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Express } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const s3UploadDuplicate = async (
  file: Express.Multer.File,
  userId: string,
  folder: string = 'taxReports',
): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('S3 bucket name is not configured');
  }

  const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
  const key = `${folder}/${userId}/${sanitizedFilename}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return fileUrl;
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error('Failed to upload file to S3');
  }
};

export const getDownloadUrl = async (key: string, filename: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 60 });
};
