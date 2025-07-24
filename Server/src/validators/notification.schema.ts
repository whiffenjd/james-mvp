// validators/notification.schema.ts
import { z } from 'zod';

export const NotificationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  entityType: z.enum(['capital_call', 'distribution', 'fund_report']).optional(),
  isRead: z.coerce.boolean().optional(),
});
