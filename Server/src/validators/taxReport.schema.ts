import { z } from 'zod';

export const CreateTaxReportSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  reportURL: z.string().url('Valid URL is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  quarter: z.enum(['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'], {
    errorMap: () => ({ message: 'Invalid quarter value' }),
  }),
  createdBy: z.string().uuid('Valid UUID is required for createdBy'),
  investorIds: z
    .union([z.array(z.string().uuid('Valid UUID is required for investor ID')), z.literal('all')])
    .optional(),
});

export const UpdateTaxReportSchema = CreateTaxReportSchema.partial({
  projectName: true,
  reportURL: true,
  year: true,
  quarter: true,
  createdBy: true,
  investorIds: true,
}).extend({
  id: z.string().uuid('Valid UUID is required for id'),
});

export const GetTaxReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number')
    .optional(),
  quarter: z.enum(['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4']).optional(),
});
