import express from 'express';
import { createFundReport, getFundReportsByFund } from '../Controllers/fundReport.controller';

import multer from 'multer'; // For file upload
import { verifyToken } from '../Middlewares/VerifyToken';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post(
  '/create',
  verifyToken,
  upload.single('document'),
  createFundReport as unknown as express.RequestHandler,
);
router.get(
  '/by-fund/:fundId',
  verifyToken,
  getFundReportsByFund as unknown as express.RequestHandler,
);

export default router;
