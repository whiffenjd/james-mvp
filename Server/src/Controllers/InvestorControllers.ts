import { Request, Response } from "express";
import {
  registerInvestor,
  resendInvestorOtp,
  verifyInvestorOtp,
} from "../Services/AuthServices";

export const signupInvestor = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerInvestor(name, email, password);
    res.status(200).json({
      success: true,
      message: "OTP sent to email",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

export const verifyInvestor = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyInvestorOtp(email, otp);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await resendInvestorOtp(email);
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
