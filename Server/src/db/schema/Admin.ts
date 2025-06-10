import { pgTable, uuid, varchar, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const UsersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password').notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(false),
    selectedTheme: uuid('selected_theme_id'),
    metadata: jsonb('metadata').default({}),
    isOnboarded: boolean('is_onboarded').notNull().default(false),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (user) => ({
    // Indexes
    idIdx: index('users_id_idx').on(user.id),
    emailIdx: index('users_email_idx').on(user.email),
    selectedThemeIdx: index('users_selected_theme_idx').on(user.selectedTheme), // Index for theme queries
  }),
);
