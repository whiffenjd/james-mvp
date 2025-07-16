import { eq, and } from 'drizzle-orm';
import { DistributionCreate, ActivityLogCreate } from '../Types/distributions.types';
import { sql } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { activityLogs, distributions, UsersTable } from '../db/schema';

export const create = async (data: DistributionCreate) => {
  return db.transaction(async (tx) => {
    const parsedAmount = parseFloat(data.amount);
    if (isNaN(parsedAmount)) {
      throw new Error('Invalid amount format');
    }

    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

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

    const log: ActivityLogCreate = {
      entityType: 'distribution',
      entityId: distribution.id,
      action: 'created',
      performedBy: data.createdBy,
      description: `Created distribution for fund ID ${data.fundId}`,
    };

    await tx.insert(activityLogs).values({
      ...log,
      createdAt: new Date(),
    });

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
    const [existing] = await tx
      .select()
      .from(distributions)
      .where(eq(distributions.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('Distribution not found');
    }

    if (existing.investorId !== userId) {
      throw new Error('You are not authorized to update this distribution');
    }

    const [updated] = await tx
      .update(distributions)
      .set({ status, updatedAt: new Date() })
      .where(eq(distributions.id, id))
      .returning();

    const log: ActivityLogCreate = {
      entityType: 'distribution',
      entityId: id,
      action: status,
      performedBy: userId,
      description: `${status.charAt(0).toUpperCase() + status.slice(1)} distribution for fund ID ${existing.fundId}`,
    };

    await tx.insert(activityLogs).values({
      ...log,
      createdAt: new Date(),
    });

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
