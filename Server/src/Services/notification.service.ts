// Services/notification.service.ts
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import {
  userNotifications,
  activityLogs,
  funds,
  UsersTable,
  capitalCalls,
  distributions,
} from '../db/schema';
import { formatDistanceToNow } from 'date-fns';
import { alias } from 'drizzle-orm/pg-core';

export interface NotificationQuery {
  limit: number;
  offset: number;
  entityType?: 'capital_call' | 'distribution' | 'fund_report';
  isRead?: boolean;
}

export interface Notification {
  id: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  entityType: string;
  action: string;
  isRead: boolean;
  fundName: string;
  performedByName: string;
  amount: number | null;
  targetUserId: string | null;
  targetUserName: string | null;
  fundId: string;
}
export interface PaginatedNotifications {
  data: Notification[];
  totalItems: number;
  totalPages: number;
}
const TargetUser = alias(UsersTable, 'target_user');
export const getNotifications = async (
  userId: string,
  query: NotificationQuery,
): Promise<PaginatedNotifications> => {
  const { limit, offset, entityType, isRead } = query;

  // Fetch paginated notifications
  const notifications = await db
    .select({
      id: activityLogs.id,
      description: activityLogs.description,
      createdAt: activityLogs.createdAt,
      entityType: activityLogs.entityType,
      action: activityLogs.action,
      isRead: userNotifications.isRead,
      fundName: funds.name,
      fundId: funds.id,
      performedByName: UsersTable.name,
      amount: sql<number | null>`
        CASE 
          WHEN ${activityLogs.entityType} = 'capital_call' THEN ${capitalCalls.amount}
          WHEN ${activityLogs.entityType} = 'distribution' THEN ${distributions.amount}
          ELSE NULL 
        END
      `,
      targetUserId: sql<string | null>`
        CASE 
          WHEN ${activityLogs.entityType} = 'capital_call' THEN ${capitalCalls.investorId}
          WHEN ${activityLogs.entityType} = 'distribution' THEN ${distributions.investorId}
          ELSE NULL 
        END
      `,
      targetUserName: sql<string | null>`
        CASE 
          WHEN ${activityLogs.entityType} IN ('capital_call', 'distribution') THEN target_user.name
          ELSE NULL 
        END
      `,
    })
    .from(userNotifications)
    .innerJoin(activityLogs, eq(userNotifications.activityLogId, activityLogs.id))
    .innerJoin(funds, eq(activityLogs.fundId, funds.id))
    .innerJoin(UsersTable, eq(activityLogs.performedBy, UsersTable.id))
    .leftJoin(
      capitalCalls,
      and(eq(activityLogs.entityType, 'capital_call'), eq(activityLogs.entityId, capitalCalls.id)),
    )
    .leftJoin(
      distributions,
      and(eq(activityLogs.entityType, 'distribution'), eq(activityLogs.entityId, distributions.id)),
    )
    .leftJoin(
      TargetUser,
      sql`
        (${activityLogs.entityType} = 'capital_call' AND ${capitalCalls.investorId} = ${TargetUser.id})
        OR
        (${activityLogs.entityType} = 'distribution' AND ${distributions.investorId} = ${TargetUser.id})
      `,
    )
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isDeleted, false),
        entityType ? eq(activityLogs.entityType, entityType) : undefined,
        isRead !== undefined ? eq(userNotifications.isRead, isRead) : undefined,
      ),
    )
    .limit(limit)
    .offset(offset)
    .orderBy(desc(activityLogs.createdAt));

  // Count total matching notifications
  const [countResult] = await db
    .select({ totalItems: sql<number>`count(*)` })
    .from(userNotifications)
    .innerJoin(activityLogs, eq(userNotifications.activityLogId, activityLogs.id))
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isDeleted, false),
        entityType ? eq(activityLogs.entityType, entityType) : undefined,
        isRead !== undefined ? eq(userNotifications.isRead, isRead) : undefined,
      ),
    );

  const totalItems = Number(countResult.totalItems);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: notifications.map((n) => ({
      id: n.id,
      description:
        n.targetUserId === userId
          ? personalizeDescription(n, true)
          : personalizeDescription(n, false),
      timeAgo: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
      timestamp: n.createdAt.toISOString(),
      entityType: n.entityType,
      action: n.action,
      isRead: n.isRead,
      fundName: n.fundName,
      fundId: n.fundId,
      performedByName: n.performedByName,
      amount: n.amount,
      targetUserId: n.targetUserId,
      targetUserName: n.targetUserName,
    })),
    totalItems,
    totalPages,
  };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false),
        eq(userNotifications.isDeleted, false),
      ),
    );

  return Number(result.count);
};

export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
  const [notification] = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.activityLogId, notificationId),
        eq(userNotifications.isDeleted, false),
      ),
    )
    .limit(1);

  if (!notification) {
    throw new Error('Notification not found or already deleted');
  }

  await db
    .update(userNotifications)
    .set({ isRead: true, updatedAt: new Date() })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.activityLogId, notificationId),
      ),
    );
};
export const markAllAsRead = async (userId: string): Promise<void> => {
  await db
    .update(userNotifications)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isDeleted, false),
        eq(userNotifications.isRead, false), // Only update unread notifications
      ),
    );
};

export const deleteNotification = async (userId: string, notificationId: string): Promise<void> => {
  const [notification] = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.activityLogId, notificationId),
        eq(userNotifications.isDeleted, false),
      ),
    )
    .limit(1);

  if (!notification) {
    throw new Error('Notification not found or already deleted');
  }

  await db
    .update(userNotifications)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.activityLogId, notificationId),
      ),
    );
};

// Helper function to personalize notification descriptions
function personalizeDescription(notification: any, isTargetUser: boolean): string {
  const { description, entityType, action, fundName, performedByName, amount, targetUserName } =
    notification;

  if (entityType === 'capital_call') {
    if (action === 'created') {
      return isTargetUser
        ? `You were requested to invest $${amount} in ${fundName}`
        : `${targetUserName || 'An investor'} was requested to invest $${amount} in ${fundName} by ${performedByName}`;
    }
    if (action === 'approved') {
      return isTargetUser
        ? `You approved a capital call of $${amount} for ${fundName}`
        : `${targetUserName || 'An investor'} approved a capital call of $${amount} for ${fundName}`;
    }
    if (action === 'rejected') {
      return isTargetUser
        ? `You rejected a capital call of $${amount} for ${fundName}`
        : `${targetUserName || 'An investor'} rejected a capital call of $${amount} for ${fundName}`;
    }
  }
  if (entityType === 'distribution') {
    if (action === 'created') {
      return isTargetUser
        ? `You received a distribution of $${amount} from ${fundName}`
        : `${targetUserName || 'An investor'} received a distribution of $${amount} from ${fundName} by ${performedByName}`;
    }
    if (action === 'approved') {
      return isTargetUser
        ? `You approved a distribution of $${amount} for ${fundName}`
        : `${targetUserName || 'An investor'} approved a distribution of $${amount} for ${fundName}`;
    }
    if (action === 'rejected') {
      return isTargetUser
        ? `You rejected a distribution of $${amount} for ${fundName}`
        : `${targetUserName || 'An investor'} rejected a distribution of $${amount} for ${fundName}`;
    }
  }
  if (entityType === 'fund_report') {
    return `${performedByName} uploaded a fund report for ${fundName}`;
  }
  return description; // Fallback to original description
}
