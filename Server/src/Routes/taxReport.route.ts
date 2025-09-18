import express from 'express';
import {
  createTaxReport,
  getTaxReports,
  updateTaxReport,
  deleteTaxReport,
  downloadTaxReport,
} from '../Controllers/taxReport.controller';
import multer from 'multer';
import { verifyToken } from '../Middlewares/VerifyToken';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post(
  '/create',
  verifyToken,
  upload.single('document'),
  createTaxReport as unknown as express.RequestHandler,
);
router.get('/', verifyToken, getTaxReports as unknown as express.RequestHandler);
router.put(
  '/update/:id',
  verifyToken,
  upload.single('document'),
  updateTaxReport as unknown as express.RequestHandler,
);
router.delete('/delete/:id', verifyToken, deleteTaxReport as unknown as express.RequestHandler);
router.get('/:id/download', verifyToken, downloadTaxReport as unknown as express.RequestHandler);

export default router;
