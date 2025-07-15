import * as DistributionController from '../Controllers/distributions.controller';
import { verifyToken } from '../Middlewares/VerifyToken';
import express, { Router } from 'express';

const router = Router();

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
router.put(
  '/status/:id',
  verifyToken,
  DistributionController.updateStatus as unknown as express.RequestHandler,
);
router.put('/:id', verifyToken, DistributionController.update as unknown as express.RequestHandler);

export default router;
