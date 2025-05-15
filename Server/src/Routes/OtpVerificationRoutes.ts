import { Router } from "express";
import express from "express";
import {
  resendOtp,
  verifyInvestor,
} from "../Controllers/OtpVerificationControllers";
const OtpRouter = Router();

OtpRouter.post("/verifyOtp", verifyInvestor);
OtpRouter.post("/resendOtp", resendOtp as express.RequestHandler);
export default OtpRouter;
