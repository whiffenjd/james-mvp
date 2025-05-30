import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import express from 'express';

// Use AWS SDK v3 (recommended)
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME!,
    metadata: (
      _req: express.Request,
      file: Express.Multer.File,
      cb: (error: any, metadata?: any) => void,
    ) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (
      _req: express.Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void,
    ) => {
      const fileName = `logos/${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});
