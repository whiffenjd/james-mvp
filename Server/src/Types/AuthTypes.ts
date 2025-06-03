import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  role: string;
  // ... other user properties
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
