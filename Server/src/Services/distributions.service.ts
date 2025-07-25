import { eq, and } from 'drizzle-orm';
import { DistributionCreate, ActivityLogCreate } from '../Types/distributions.types';
import { sql } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { activityLogs, distributions, funds, userNotifications, UsersTable } from '../db/schema';
import { triggerEmailNotifications } from './emailNotification.service';

export const create = async (data: DistributionCreate) => {
  return db.transaction(async (tx) => {
    // Validate and transform data
    const parsedAmount = parseFloat(data.amount);
    if (isNaN(parsedAmount)) {
      throw new Error('Invalid amount format');
    }
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Insert the distribution
    const [distribution] = await tx
      .insert(distributions)
      .values({
        fundId: data.fundId,
        investorId: data.investorId,
        amount: parsedAmount,
        date: parsedDate,
        recipientName: data.recipientName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        description: data.description,
        createdBy: data.createdBy,
      })
      .returning();

    // Insert the activity log
    const [activityLog] = await tx
      .insert(activityLogs)
      .values({
        entityType: 'distribution',
        entityId: distribution.id,
        action: 'created',
        performedBy: data.createdBy,
        fundId: data.fundId,
        description: `Created distribution for fund ID ${data.fundId}`,
        createdAt: new Date(),
      })
      .returning();

    // Fetch the fund to get the fund manager, investors, and fund name
    const [fund] = await tx
      .select({
        name: funds.name,
        fundManagerId: funds.fundManagerId,
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, data.fundId));

    // Fetch creator's name for email notifications
    const [creator] = await tx
      .select({
        name: UsersTable.name,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, data.createdBy));

    // Prepare user IDs to notify (fund manager and all investors, including the creator)
    const usersToNotify = [data.investorId];

    // Insert user_notifications for each relevant user
    if (usersToNotify.length > 0) {
      await tx.insert(userNotifications).values(
        usersToNotify.map((userId) => ({
          userId,
          activityLogId: activityLog.id,
          isRead: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );

      // Trigger email notifications asynchronously
      triggerEmailNotifications({
        userIds: usersToNotify,
        notificationData: {
          entityType: 'distribution',
          action: 'created',
          fundName: fund.name,
          performedByName: creator.name,
          amount: parsedAmount,
        },
        createdBy: data.createdBy,
      });
    }
    return distribution;
  });
};

export const getAllForUser = async (
  userId: string,
  role: string,
  page: number,
  limit: number,
  fundId?: string,
) => {
  const offset = (page - 1) * limit;

  const baseQuery = db
    .select({
      ...distributions,
      InvestorName: UsersTable.name,
      InvestorEmail: UsersTable.email,
    })
    .from(distributions)
    .innerJoin(UsersTable, eq(distributions.investorId, UsersTable.id));

  // Apply conditions
  let filteredQuery;
  if (role === 'fundManager') {
    filteredQuery = baseQuery.where(
      and(
        eq(distributions.createdBy, userId),
        fundId ? eq(distributions.fundId, fundId) : undefined,
      ),
    );
  } else if (role === 'investor') {
    filteredQuery = baseQuery.where(
      and(
        eq(distributions.investorId, userId),
        fundId ? eq(distributions.fundId, fundId) : undefined,
      ),
    );
  } else if (role !== 'admin') {
    throw new Error('Invalid user role');
  } else {
    filteredQuery = baseQuery; // Admin gets all
  }

  const [data, [{ count }]] = await Promise.all([
    filteredQuery.limit(limit).offset(offset),
    db.select({ count: sql`count(*)::integer` }).from(filteredQuery.as('subquery')),
  ]);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { data, totalItems, totalPages };
};

export const updateStatus = async (id: string, status: 'approved' | 'rejected', userId: string) => {
  return db.transaction(async (tx) => {
    // Check if the distribution exists
    const [existing] = await tx
      .select()
      .from(distributions)
      .where(eq(distributions.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('Distribution not found');
    }

    // Authorize the user
    if (existing.investorId !== userId) {
      throw new Error('You are not authorized to update this distribution');
    }

    // Update the distribution status
    const [updated] = await tx
      .update(distributions)
      .set({ status, updatedAt: new Date() })
      .where(eq(distributions.id, id))
      .returning();

    // Insert the activity log
    const [activityLog] = await tx
      .insert(activityLogs)
      .values({
        entityType: 'distribution',
        entityId: id,
        action: status,
        performedBy: userId,
        fundId: updated.fundId,
        description: `${status.charAt(0).toUpperCase() + status.slice(1)} distribution for fund ID ${updated.fundId}`,
        createdAt: new Date(),
      })
      .returning();

    // Fetch the fund to get the fund manager, investors, and fund name
    const [fund] = await tx
      .select({
        name: funds.name,
        fundManagerId: funds.fundManagerId,
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, updated.fundId));

    // Fetch performer's name for email notifications
    const [performer] = await tx
      .select({
        name: UsersTable.name,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));

    // Prepare user IDs to notify (fund manager and all investors, including the performer)
    const usersToNotify = [fund.fundManagerId];

    // Insert user_notifications for each relevant user
    if (usersToNotify.length > 0) {
      await tx.insert(userNotifications).values(
        usersToNotify.map((userId) => ({
          userId,
          activityLogId: activityLog.id,
          isRead: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );

      // Trigger email notifications asynchronously
      triggerEmailNotifications({
        userIds: usersToNotify,
        notificationData: {
          entityType: 'distribution',
          action: status,
          fundName: fund.name,
          performedByName: performer.name,
          amount: updated.amount,
        },
        createdBy: userId,
      });
    }
    return updated;
  });
};

export const update = async (id: string, data: Partial<DistributionCreate>, userId: string) => {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(distributions)
      .where(eq(distributions.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('Distribution not found');
    }

    if (existing.createdBy !== userId) {
      throw new Error('You are not authorized to update this distribution');
    }

    const updateData: Partial<{
      fundId: string;
      investorId: string;
      amount: number;
      date: Date;
      recipientName: string;
      bankName: string;
      accountNumber: string;
      description: string;
      createdBy: string;
    }> = { ...data };

    if (data.amount) {
      const parsedAmount = parseFloat(data.amount);
      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount format');
      }
      updateData.amount = parsedAmount;
    }

    if (data.date) {
      const parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      updateData.date = parsedDate;
    }

    const [updated] = await tx
      .update(distributions)
      .set({
        ...updateData,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(distributions.id, id))
      .returning();

    const log: ActivityLogCreate = {
      entityType: 'distribution',
      entityId: id,
      action: 'updated',
      fundId: updated.fundId, // Use fundId from updated capital call
      performedBy: userId,
      description: `Updated distribution for fund ID ${updated.fundId}`,
    };

    await tx.insert(activityLogs).values({
      ...log,
      createdAt: new Date(),
    });

    return updated;
  });
};
