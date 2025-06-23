import { pgTable, uuid, text, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const funds = pgTable('funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  fundSize: text('fund_size').notNull(),
  fundType: text('fund_type').notNull(),
  targetGeographies: text('target_geographies').notNull(),
  targetSectors: text('target_sectors').notNull(),
  targetMOIC: text('target_moic').notNull(),
  targetIRR: text('target_irr').notNull(),
  minimumInvestment: text('minimum_investment').notNull(),
  fundLifetime: text('fund_lifetime').notNull(),
  fundDescription: text('fund_description'),
  documents: jsonb('documents').default([]),
  investors: jsonb('investors').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});
