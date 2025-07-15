import { Router } from 'express';
import * as CapitalCallController from '../Controllers/capitalCall.controller';

import express from 'express';
import { verifyToken } from '../Middlewares/VerifyToken';
const router = Router();

router.post(
  '/create',
  verifyToken,
  CapitalCallController.create as unknown as express.RequestHandler,
);
router.get('/list', verifyToken, CapitalCallController.getAll as unknown as express.RequestHandler);
router.patch(
  '/:id/status',
  verifyToken,
  CapitalCallController.updateStatus as unknown as express.RequestHandler,
);
router.patch(
  '/:id',
  verifyToken,
  CapitalCallController.update as unknown as express.RequestHandler,
);

export default router;
