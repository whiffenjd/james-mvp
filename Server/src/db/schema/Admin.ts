import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password").notNull(),

  role: varchar("role", { length: 50 }).notNull(), // 'admin', 'investor', 'fundManager'

  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(false),

  metadata: jsonb("metadata").default({}), // Role-specific flexible fields

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
// src/db/schema/otp.ts

export const OtpTable = pgTable("otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),

  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"), // null if not verified

  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
