# Postgres Tables

---

````md
# 📄 Database Schema

## 🧑‍💼 Users Table

This table stores user account details, including roles, authentication, and metadata.

```ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password").notNull(),

    role: varchar("role", { length: 50 }).notNull(),

    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false),

    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (user) => ({
    // Indexes
    idIdx: index("users_id_idx").on(user.id),
    emailIdx: index("users_email_idx").on(user.email),
  })
);
```
````

### 🔍 Fields

| Field             | Type      | Description                   |
| ----------------- | --------- | ----------------------------- |
| `id`              | UUID      | Primary key, auto-generated   |
| `name`            | String    | User’s full name              |
| `email`           | String    | Unique email, indexed         |
| `password`        | String    | Hashed password               |
| `role`            | String    | User role (e.g., admin, user) |
| `isEmailVerified` | Boolean   | Email verification flag       |
| `isActive`        | Boolean   | Account activation flag       |
| `metadata`        | JSON      | Additional user data          |
| `createdAt`       | Timestamp | Record creation time          |
| `updatedAt`       | Timestamp | Last update time              |

---

## 🔐 OTP Table

This table manages OTP (One-Time Password) verification for email confirmation and login authentication.

```ts
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
```

### 🔍 Fields

| Field        | Type      | Description                          |
| ------------ | --------- | ------------------------------------ |
| `id`         | UUID      | Primary key, auto-generated          |
| `email`      | String    | Email associated with the OTP        |
| `otp`        | String    | One-time password code               |
| `expiresAt`  | Timestamp | Expiration time of the OTP           |
| `verifiedAt` | Timestamp | When the OTP was verified (nullable) |
| `isUsed`     | Boolean   | Whether the OTP has been used        |
| `createdAt`  | Timestamp | Creation time                        |

---

## 🧠 Notes

- All timestamps use the default timezone (UTC unless configured otherwise).
- `metadata` is flexible for storing user-specific preferences or flags.
- OTPs are typically valid for a short period (e.g., 10 minutes) and should not be reused.

---
