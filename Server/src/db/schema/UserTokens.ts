import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const UserTokens = pgTable(
  'user_tokens',
  {
      id: uuid("id").primaryKey().defaultRandom(),
    
    userId: uuid('user_id').notNull(),
    email: varchar('email', { length: 512 }).notNull(),

    token: varchar('token', { length: 512 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // e.g., 'auth', 'reset_password'

    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    userRole: varchar('user_role', { length: 50 }).notNull(),
  },
  (t) => ({
    userIdIdx: index('user_tokens_user_id_idx').on(t.userId),
    tokenIdx: index('user_tokens_token_idx').on(t.token),
  }),
);
