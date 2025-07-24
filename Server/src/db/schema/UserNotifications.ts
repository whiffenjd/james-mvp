import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { UsersTable } from './Admin';
import { activityLogs } from './ActivityLogs';
import { unique } from 'drizzle-orm/gel-core';

export const userNotifications = pgTable(
  'user_notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => UsersTable.id),
    activityLogId: uuid('activity_log_id')
      .notNull()
      .references(() => activityLogs.id),
    isRead: boolean('is_read').default(false).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqueUserActivity: unique('unique_user_activity').on(table.userId, table.activityLogId),
  }),
);
