import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { funds } from './Funds';
import { UsersTable } from './Admin';

export const capitalCalls = pgTable('capital_calls', {
  id: uuid('id').primaryKey().defaultRandom(),

  fundId: uuid('fund_id')
    .notNull()
    .references(() => funds.id),

  investorId: uuid('investor_id')
    .notNull()
    .references(() => UsersTable.id),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => UsersTable.id), // This is the fundManager creating the call

  amount: numeric('amount').notNull(),
  date: timestamp('date').notNull(),

  recipientName: text('recipient_name').notNull(),
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  description: text('description').notNull(),

  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
