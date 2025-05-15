import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";

export const UserTokens = pgTable(
  "user_tokens",
  {
    userId: uuid("user_id").notNull(),
    email: varchar("email", { length: 512 }).notNull(),
    token: varchar("token", { length: 512 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idIdx: index("user_tokens_user_id_idx").on(t.userId), // Explicit index on ID
  })
);
