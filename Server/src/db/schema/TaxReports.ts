import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { UsersTable } from './Admin';

export const QuarterEnum = pgEnum('quarter', ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4']);

export const taxReports = pgTable('tax_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectName: text('project_name').notNull(),
  reportURL: text('report_url').notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => UsersTable.id),
  year: text('year').notNull(),
  quarter: QuarterEnum('quarter').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
