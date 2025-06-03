import { Router } from 'express';
import { verifyToken } from '../Middlewares/VerifyToken';
import { documentUpload } from '../Middlewares/DocumentUploadMiddleware';
import { deleteDocument, uploadDocuments } from '../Controllers/DocumentUploadController';

const documentUploadRouter = Router();

// Upload multiple documents with cleanup
documentUploadRouter.post(
  '/upload',
  verifyToken,
  documentUpload.cleanupPreviousUploads, // Add cleanup middleware
  documentUpload.upload.array('documents', 10),
  uploadDocuments,
);

// Delete a document
documentUploadRouter.delete('/:key', verifyToken, deleteDocument);

export default documentUploadRouter;
