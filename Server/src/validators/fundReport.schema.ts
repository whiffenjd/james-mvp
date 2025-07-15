import { z } from 'zod';

export const CreateFundReportSchema = z.object({
  fundId: z.string().uuid(),
  projectName: z.string().min(1),
  description: z.string().min(1),
  documentUrl: z.string().url(), // Assuming S3 URL will be validated as a URL
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  quarter: z.string().regex(/^(Q[1-4])$/, 'Quarter must be Q1, Q2, Q3, or Q4'),
});
