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
import { UsersTable } from './Admin';

// Main onboarding table for investors
export const InvestorOnboardingTable = pgTable(
  'investor_onboarding',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => UsersTable.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 30 }).notNull().default('pending'), // pending, approved, rejected
    rejectionNote: varchar('rejection_note', { length: 1024 }),

    formData: jsonb('form_data').notNull().default({}),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (onboard) => ({
    userIdIdx: index('investor_onboarding_user_id_idx').on(onboard.userId),
  }),
);

// Documents table for uploads
export const OnboardingDocumentTable = pgTable(
  'onboarding_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    onboardingId: uuid('onboarding_id')
      .notNull()
      .references(() => InvestorOnboardingTable.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(), // e.g. 'kyc', 'address', 'entity_doc'
    fileUrl: varchar('file_url', { length: 1024 }).notNull(),
    fileName: varchar('file_name', { length: 255 }),
    uploadedAt: timestamp('uploaded_at').defaultNow(),
  },
  (doc) => ({
    onboardingIdIdx: index('onboarding_documents_onboarding_id_idx').on(doc.onboardingId),
  }),
);
