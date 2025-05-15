import { Request, Response } from "express";
import { loginUser } from "../Services/AuthServices";
import {
  requestPasswordReset,
  resetPassword,
} from "../Services/ForgotPasswordServices";
import { db } from "../db/DbConnection";
import { UserTokens } from "../db/schema";
import { eq } from "drizzle-orm";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const result = await loginUser(email, password, role);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: (err as Error).message,
    });
  }
};
export const requestPasswordResetMail = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = await requestPasswordReset(email);
    res.status(200).json({
      success: true,
      message: result,
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  try {
    const result = await resetPassword(email, token, newPassword);
    res.status(200).json({
      success: true,
      message: result,
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: (err as Error).message,
    });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user." });
    }

    await db.delete(UserTokens).where(eq(UserTokens.userId, userId));

    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ message: "Logout failed." });
  }
};
