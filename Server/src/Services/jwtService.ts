// src/services/jwt.service.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const signToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const generateResetToken = (email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ email }, secret, { expiresIn: "15m" });
};

export const verifyResetToken = (token: string): { email: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, secret) as unknown as { email: string };
};
