import * as DistributionController from '../Controllers/distributions.controller';
import { verifyToken } from '../Middlewares/VerifyToken';
import express, { Router } from 'express';

const router = Router();

router.patch(
  '/status/:id',
  verifyToken,
  DistributionController.updateStatus as unknown as express.RequestHandler,
);
router.post(
  '/create',
  verifyToken,
  DistributionController.create as unknown as express.RequestHandler,
);
router.get(
  '/list',
  verifyToken,
  DistributionController.getAll as unknown as express.RequestHandler,
);
router.patch(
  '/:id',
  verifyToken,
  DistributionController.update as unknown as express.RequestHandler,
);

export default router;
