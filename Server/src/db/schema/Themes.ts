import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const themes = pgTable('themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  dashboardBackground: varchar('dashboard_background').notNull(),
  cardBackground: varchar('card_background').notNull(),
  primaryText: varchar('primary_text').notNull(),
  secondaryText: varchar('secondary_text').notNull(),
  sidebarAccentText: varchar('sidebar_accent_text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
