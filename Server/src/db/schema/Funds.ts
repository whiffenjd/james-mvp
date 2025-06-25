import { pgTable, uuid, text, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const funds = pgTable('funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  fundSize: numeric('fund_size').notNull(),
  fundType: text('fund_type').notNull(),
  targetGeographies: text('target_geographies').notNull(),
  targetSectors: text('target_sectors').notNull(),
  targetMOIC: numeric('target_moic').notNull(),
  targetIRR: numeric('target_irr').notNull(),
  minimumInvestment: numeric('minimum_investment').notNull(),
  fundManagerId: text('fund_manager_id').notNull(),
  fundLifetime: text('fund_lifetime').notNull(),
  fundDescription: text('fund_description'),
  documents: jsonb('documents').default([]),
  investors: jsonb('investors').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});
