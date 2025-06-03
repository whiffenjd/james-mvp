import { Router } from 'express';
import * as onboardingController from '../Controllers/InvestorOnboardingControllers';
import { verifyToken } from '../Middlewares/VerifyToken';
import { Request, Response, NextFunction } from 'express';

const investorOnboardingRouter = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

investorOnboardingRouter.post(
  '/start',
  asyncHandler(verifyToken),
  asyncHandler(onboardingController.startOnboarding),
);

investorOnboardingRouter.put(
  '/update',
  asyncHandler(verifyToken),
  asyncHandler(onboardingController.updateOnboarding),
);

investorOnboardingRouter.get(
  '/status',
  asyncHandler(verifyToken),
  asyncHandler(onboardingController.getOnboardingStatus),
);

investorOnboardingRouter.get(
  '/info',
  asyncHandler(verifyToken),
  asyncHandler(onboardingController.getOnboardingInfo),
);

export default investorOnboardingRouter;
