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

// Junction table for tax reports and investors
export const taxReportInvestors = pgTable('tax_report_investors', {
  taxReportId: uuid('tax_report_id')
    .notNull()
    .references(() => taxReports.id, { onDelete: 'cascade' }),
  investorId: uuid('investor_id')
    .notNull()
    .references(() => UsersTable.id, { onDelete: 'cascade' }),
});
