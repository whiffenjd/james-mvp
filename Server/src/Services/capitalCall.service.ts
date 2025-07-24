import { and, eq, sql } from 'drizzle-orm';
import { ActivityLogCreate, CapitalCallCreate } from '../Types/capitalCall.types';
import { db } from '../db/DbConnection';
import { capitalCalls } from '../db/schema/CapitalCall';
import { activityLogs } from '../db/schema/ActivityLogs';
import { funds, userNotifications, UsersTable } from '../db/schema';

export const create = async (data: CapitalCallCreate) => {
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

    // Insert the capital call
    const [capitalCall] = await tx
      .insert(capitalCalls)
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
        entityType: 'capital_call',
        entityId: capitalCall.id,
        action: 'created',
        performedBy: data.createdBy,
        fundId: data.fundId,
        description: `Created capital call for fund ID ${data.fundId}`,
      })
      .returning();

    // Fetch the fund to get the fund manager and investors
    const [fund] = await tx
      .select({
        fundManagerId: funds.fundManagerId,
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, data.fundId));

    // Prepare user IDs to notify (fund manager and investors, excluding the creator)
    const usersToNotify = [fund.fundManagerId, ...fund.investorIds];
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
    }

    return capitalCall;
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

  // Build base query with join to UsersTable
  const baseQuery = db
    .select({
      ...capitalCalls,
      InvestorName: UsersTable.name,
      InvestorEmail: UsersTable.email,
    })
    .from(capitalCalls)
    .innerJoin(UsersTable, eq(capitalCalls.investorId, UsersTable.id));

  // Apply filters
  let filteredQuery;
  if (role === 'fundManager') {
    filteredQuery = baseQuery.where(
      and(eq(capitalCalls.createdBy, userId), fundId ? eq(capitalCalls.fundId, fundId) : undefined),
    );
  } else if (role === 'investor') {
    filteredQuery = baseQuery.where(
      and(
        eq(capitalCalls.investorId, userId),
        fundId ? eq(capitalCalls.fundId, fundId) : undefined,
      ),
    );
  } else if (role !== 'admin') {
    throw new Error('Invalid user role');
  } else {
    filteredQuery = baseQuery;
  }

  // Get paginated results and total count
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
    // Check if the capital call exists
    const [existing] = await tx.select().from(capitalCalls).where(eq(capitalCalls.id, id)).limit(1);

    if (!existing) {
      throw new Error('Capital call not found');
    }

    // Authorize the user
    if (existing.investorId !== userId) {
      throw new Error('You are not authorized to update this capital call');
    }

    // Update the capital call status
    const [updated] = await tx
      .update(capitalCalls)
      .set({ status, updatedAt: new Date() })
      .where(eq(capitalCalls.id, id))
      .returning();

    // Insert the activity log
    const [activityLog] = await tx
      .insert(activityLogs)
      .values({
        entityType: 'capital_call',
        entityId: id,
        action: status,
        performedBy: userId,
        fundId: updated.fundId,
        description: `${status.charAt(0).toUpperCase() + status.slice(1)} capital call for fund ID ${updated.fundId}`,
        createdAt: new Date(),
      })
      .returning();

    // Fetch the fund to get the fund manager and investors
    const [fund] = await tx
      .select({
        fundManagerId: funds.fundManagerId,
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, updated.fundId));

    // Prepare user IDs to notify (fund manager and investors, excluding the performer)
    const usersToNotify = [fund.fundManagerId, ...fund.investorIds];

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
    }

    return updated;
  });
};

export const update = async (id: string, data: Partial<CapitalCallCreate>, userId: string) => {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(capitalCalls).where(eq(capitalCalls.id, id)).limit(1);

    if (!existing) {
      throw new Error('Capital call not found');
    }

    if (existing.createdBy !== userId) {
      throw new Error('You are not authorized to update this capital call');
    }

    // Validate and transform data
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
      .update(capitalCalls)
      .set({
        ...updateData,
        status: 'pending', // Reset to pending on update (as per current logic)
        updatedAt: new Date(),
      })
      .where(eq(capitalCalls.id, id))
      .returning();

    const log: ActivityLogCreate = {
      entityType: 'capital_call',
      entityId: id,
      action: 'updated',
      performedBy: userId,
      fundId: updated.fundId, // Use fundId from updated capital call
      description: `Updated capital call for fund ID ${updated.fundId}`,
    };

    await tx.insert(activityLogs).values({
      ...log,
      createdAt: new Date(),
    });

    return updated;
  });
};
