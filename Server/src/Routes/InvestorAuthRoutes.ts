// src/routes/investor.routes.ts
import { Router } from "express";
import { signupInvestor } from "../Controllers/InvestorAuthControllers";
const investorAuthRouter = Router();

investorAuthRouter.post("/investorSignup", signupInvestor);
export default investorAuthRouter;
