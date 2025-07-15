import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { funds } from './Funds';
import { UsersTable } from './Admin';

export const fundReports = pgTable('fund_reports', {
  id: uuid('id').primaryKey().defaultRandom(),

  fundId: uuid('fund_id')
    .notNull()
    .references(() => funds.id),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => UsersTable.id),

  projectName: text('project_name').notNull(),
  description: text('description').notNull(),
  documentUrl: text('document_url').notNull(),

  year: text('year').notNull(),
  quarter: text('quarter').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});
