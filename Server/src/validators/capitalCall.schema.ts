import { z } from 'zod';

export const CapitalCallCreateSchema = z.object({
  fundId: z.string().uuid('Invalid fund ID'),
  investorId: z.string().uuid('Invalid investor ID'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  date: z.string().datetime('Invalid date format'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  description: z.string().min(1, 'Description is required'),
});

export const CapitalCallStatusUpdateSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be either "approved" or "rejected"' }),
  }),
});

export const CapitalCallUpdateSchema = z
  .object({
    fundId: z.string().uuid('Invalid fund ID').optional(),
    investorId: z.string().uuid('Invalid investor ID').optional(),
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places')
      .optional(),
    date: z.string().datetime('Invalid date format').optional(),
    recipientName: z.string().min(1, 'Recipient name is required').optional(),
    bankName: z.string().min(1, 'Bank name is required').optional(),
    accountNumber: z.string().min(1, 'Account number is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
  })
  .refine(
    (data) =>
      data.fundId ||
      data.investorId ||
      data.amount ||
      data.date ||
      data.recipientName ||
      data.bankName ||
      data.accountNumber ||
      data.description,
    {
      message: 'At least one field must be provided for update',
    },
  );

export type CapitalCallCreate = z.infer<typeof CapitalCallCreateSchema>;
export type CapitalCallStatusUpdate = z.infer<typeof CapitalCallStatusUpdateSchema>;
export type CapitalCallUpdate = z.infer<typeof CapitalCallUpdateSchema>;
