import * as AdminController from '../Controllers/admin.controller';
import { verifyToken } from '../Middlewares/VerifyToken';
import express, { Router } from 'express';

const router = Router();

// Check subdomain availability
router.get(
  '/check-subdomain',
  verifyToken,
  AdminController.checkSubdomain as unknown as express.RequestHandler,
);

// Create a fund manager
router.post(
  '/fund-managers',
  verifyToken,
  AdminController.createFundManager as unknown as express.RequestHandler,
);

router.get(
  '/fund-managers',
  verifyToken,
  AdminController.getFundManagers as unknown as express.RequestHandler,
);
router.delete(
  '/fund-managers/:id',
  verifyToken,
  AdminController.deleteFundManager as unknown as express.RequestHandler,
);
router.get(
  '/investors',
  verifyToken,
  AdminController.getInvestors as unknown as express.RequestHandler,
);
router.delete(
  '/investors/:id',
  verifyToken,
  AdminController.deleteInvestor as unknown as express.RequestHandler,
);

export default router;
