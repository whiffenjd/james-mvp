import { Request, Response, NextFunction } from 'express';
import { db } from '../db/DbConnection';
import { UsersTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { sendErrorResponse } from '../Utils/response';
export interface CustomRequest extends Request {
  fundManager?: any; // or specify the type of fundManager if you know it
  cache: any;
  credentials: any;
  destination: any;
  integrity: any;
}
export const subdomainMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const url = new URL(origin || referer); // fallback to referer if origin is missing

  const frontendHost = url.hostname; // e.g. "alpha.localhost"
  const subdomain = frontendHost.split('.')[0].toLowerCase();

  console.log('subdomain', origin, subdomain);

  // Allow main domain (mvp.jidatit.uk or localhost:3000) or reserved subdomains
  if (!subdomain || ['www', 'mvp'].includes(subdomain)) {
    req.fundManager = null;
    return next();
  }

  // Validate subdomain format
  const regex = /^[a-z0-9-]{1,63}$/;
  if (!regex.test(subdomain)) {
    return sendErrorResponse(res, 'Invalid subdomain format', 400);
  }

  // Check if subdomain exists
  const [fundManager] = await db
    .select({ id: UsersTable.id, subdomain: UsersTable.subdomain })
    .from(UsersTable)
    .where(and(eq(UsersTable.subdomain, subdomain), eq(UsersTable.role, 'fundManager')))
    .limit(1);

  if (!fundManager) {
    return sendErrorResponse(res, 'Subdomain not found', 404);
  }
  console.log('fundManager', fundManager);
  req.fundManager = fundManager;
  next();
};
