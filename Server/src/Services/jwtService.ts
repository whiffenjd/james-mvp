// src/services/jwt.service.ts
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const signToken = (payload: object) => {
  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: expiresInSeconds,
  });
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000); // convert to ms
  return { token, expiresAt };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const generateResetToken = (email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ email }, secret, { expiresIn: '15m' });
};

export const verifyResetToken = (token: string): { email: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, secret) as { email: string };
  } catch (err) {
    if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
      throw new Error('The reset link is invalid or has expired.');
    }
    throw new Error('An error occurred while verifying the reset link.');
  }
};
