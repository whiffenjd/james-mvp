// src/routes/investor.routes.ts
import { Router } from "express";
import {
  resendOtp,
  signupInvestor,
  verifyInvestor,
} from "../Controllers/InvestorControllers";
import express from "express";
const investorRouter = Router();

investorRouter.post("/signup", signupInvestor);
investorRouter.post("/verify", verifyInvestor);
investorRouter.post("/resend", resendOtp as express.RequestHandler);
export default investorRouter;
