import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { UsersTable } from './Admin';
import { funds } from './Funds';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  entityType: text('entity_type').notNull(), // e.g., 'capital_call', 'distribution', etc.
  entityId: uuid('entity_id').notNull(), // UUID of the entity being acted upon

  action: text('action').notNull(), // e.g., 'created', 'approved', 'rejected'

  performedBy: uuid('performed_by')
    .notNull()
    .references(() => UsersTable.id), // User who performed the action
  fundId: uuid('fund_id')
    .notNull()
    .references(() => funds.id), // Reference to the fund

  description: text('description'), // Optional: human-readable message

  createdAt: timestamp('created_at').defaultNow(),
});
