import express from 'express';
import {
  getKycDocuments,
  updateKycDocuments,
  approveKycDocuments,
  requestReupload,
  downloadKycDocument,
} from '../Controllers/kycDocuments.controller';
import { verifyToken } from '../Middlewares/VerifyToken';

const router = express.Router();

router.get('/', verifyToken, getKycDocuments as unknown as express.RequestHandler);
router.put('/update/:id', verifyToken, updateKycDocuments as unknown as express.RequestHandler);
router.put('/approve/:id', verifyToken, approveKycDocuments as unknown as express.RequestHandler);
router.put(
  '/request-reupload/:id',
  verifyToken,
  requestReupload as unknown as express.RequestHandler,
);
router.get(
  '/:id/download/:docType',
  verifyToken,
  downloadKycDocument as unknown as express.RequestHandler,
);

export default router;
