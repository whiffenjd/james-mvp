import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
export const OtpTable = pgTable(
  "otp",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    email: varchar("email", { length: 255 }).notNull(),
    otp: varchar("otp", { length: 10 }).notNull(),

    expiresAt: timestamp("expires_at").notNull(),
    verifiedAt: timestamp("verified_at"),
    isUsed: boolean("is_used").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (otp) => ({
    emailIdx: index("otp_email_idx").on(otp.email),
    otpIdx: index("otp_otp_idx").on(otp.otp),
  })
);
