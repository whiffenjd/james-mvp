import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { UsersTable } from './Admin';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  entityType: text('entity_type').notNull(), // e.g., 'capital_call', 'distribution', etc.
  entityId: uuid('entity_id').notNull(), // UUID of the entity being acted upon

  action: text('action').notNull(), // e.g., 'created', 'approved', 'rejected'

  performedBy: uuid('performed_by')
    .notNull()
    .references(() => UsersTable.id), // User who performed the action

  description: text('description'), // Optional: human-readable message

  createdAt: timestamp('created_at').defaultNow(),
});
