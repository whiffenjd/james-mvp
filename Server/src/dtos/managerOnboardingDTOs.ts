import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export const UpdateOnboardingStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  rejectionNote: z.string().optional(),
});

export interface InvestorListItem {
  id: string;
  name: string;
  email: string;
  onboardingStatus: string;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UpdateOnboardingStatusRequest = z.infer<typeof UpdateOnboardingStatusSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
