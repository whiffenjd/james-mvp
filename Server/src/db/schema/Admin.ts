import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';

export const UsersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password').notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    subdomain: varchar('subdomain', { length: 100 }).unique(),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(false),
    selectedTheme: uuid('selected_theme_id'),
    metadata: jsonb('metadata').default({}),
    referral: uuid('referral').references(() => UsersTable.id, {
      onDelete: 'set null',
    }), // self-referencing foreign key
    isOnboarded: boolean('is_onboarded').notNull().default(false),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (user) => ({
    idIdx: index('users_id_idx').on(user.id),
    emailIdx: index('users_email_idx').on(user.email),
    selectedThemeIdx: index('users_selected_theme_idx').on(user.selectedTheme),
    subdomainIdx: index('users_subdomain_idx').on(user.subdomain),
    referralIdx: index('users_referral_idx').on(user.referral),
  }),
);
