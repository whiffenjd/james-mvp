import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { UserTokens } from '../db/schema';

dotenv.config();
interface JwtPayload {
  id: string;
  role: string;
}

// 👇 Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Check token exists in DB
    const storedToken = await db.query.UserTokens.findFirst({
      where: eq(UserTokens.userId, decoded.id),
    });

    if (!storedToken || storedToken.token !== token) {
      res.status(401).json({ message: 'Session expired or logged out.' });
      return;
    }

    // ⏳ Check if token has expired based on DB's expiresAt
    if (new Date() > new Date(storedToken.expiresAt)) {
      res.status(401).json({ message: 'Token expired.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }
};
