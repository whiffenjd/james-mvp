import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './VerifyToken';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> | void => {
  if (req.user?.role !== 'fundManager') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Fund Manager privileges required.',
    });
    return;
  }
  next();
};
