import { Router } from 'express';
import * as managerOnboardingController from '../Controllers/managerOnboardingController';
import { verifyToken } from '../Middlewares/VerifyToken';
import { verifyAdmin } from '../Middlewares/VerifyAdmin';
import { asyncHandler } from '../Utils/asyncHandler';

const managerOnboardingRouter = Router();

managerOnboardingRouter.use(verifyToken);

managerOnboardingRouter.get(
  '/investors',
  asyncHandler(managerOnboardingController.getInvestorsList),
);

managerOnboardingRouter.get(
  '/investors/:investorId',
  asyncHandler(managerOnboardingController.getInvestorDetails),
);

managerOnboardingRouter.put(
  '/onboarding/:onboardingId/status',
  asyncHandler(managerOnboardingController.updateOnboardingStatus),
);

managerOnboardingRouter.delete(
  '/onboarding/:onboardingId',
  asyncHandler(managerOnboardingController.deleteOnboarding),
);

export default managerOnboardingRouter;
