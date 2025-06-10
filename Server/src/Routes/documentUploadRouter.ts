import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../Middlewares/VerifyToken';
import { documentUpload } from '../Middlewares/DocumentUploadMiddleware';
import { deleteDocument, uploadDocuments } from '../Controllers/DocumentUploadController';
import type { AuthenticatedRequest } from '../Types/AuthTypes';

const documentUploadRouter = Router();

interface MulterRequest extends AuthenticatedRequest {
  files: Express.Multer.File[];
}

// Upload multiple documents with cleanup
documentUploadRouter.post(
  '/upload',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await documentUpload.cleanupPreviousUploads(req as MulterRequest, res, next);
  },
  documentUpload.upload.array('documents', 10),
  async (req: Request, res: Response) => {
    await uploadDocuments(req as MulterRequest, res);
  },
);

// Delete a document
documentUploadRouter.delete('/:key', verifyToken, async (req: Request, res: Response) => {
  await deleteDocument(req as AuthenticatedRequest, res);
});

export default documentUploadRouter;
