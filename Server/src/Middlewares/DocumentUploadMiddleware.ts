import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import express from 'express';
import { AuthenticatedRequest } from '../Types/AuthTypes';
import { deleteS3Folder } from '../Utils/s3Utils';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Create base multer upload configuration
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE, // Add this line
    metadata: (
      req: express.Request,
      file: Express.Multer.File,
      cb: (error: any, metadata?: any) => void,
    ) => {
      const authReq = req as AuthenticatedRequest;
      cb(null, {
        userId: authReq.user?.id,
        fieldName: file.fieldname,
        contentType: file.mimetype, // Add content type to metadata
      });
    },
    key: (
      req: express.Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void,
    ) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const fileName = `onboarding/${userId}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
    }
  },
});

// Create middleware to clean up old files
import { Response, NextFunction } from 'express';

export const cleanupPreviousUploads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Delete existing folder for this user
    await deleteS3Folder(userId);
    next();
  } catch (error) {
    next(error);
  }
};

// Update export
export const documentUpload = {
  upload,
  cleanupPreviousUploads,
};
