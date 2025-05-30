import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const websiteAssets = pgTable('website_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  logoUrl: varchar('logo_url').notNull(),
  projectName: varchar('project_name').notNull(),
  projectDescription: varchar('project_description').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
