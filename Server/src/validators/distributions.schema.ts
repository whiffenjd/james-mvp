import { z } from 'zod';

export const DistributionCreateSchema = z.object({
  fundId: z.string().uuid(),
  investorId: z.string().uuid(),
  amount: z.string().transform((val) => parseFloat(val)),
  date: z.string().datetime(),
  recipientName: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  description: z.string().min(1),
});

export const DistributionStatusUpdateSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const DistributionUpdateSchema = DistributionCreateSchema.partial();
