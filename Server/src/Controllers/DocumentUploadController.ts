import { Response } from 'express';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AuthenticatedRequest } from '../Types/AuthTypes';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Return array of uploaded file URLs
    const uploadedFiles = files.map((file) => ({
      url: (file as any).location || file.path,
      key: (file as any).key,
      fileName: file.originalname,
      type: req.body.documentType,
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;

    // Ensure the file belongs to the user
    if (!key.includes(`onboarding/${req.user?.id}/`)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this file',
      });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
      }),
    );

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
