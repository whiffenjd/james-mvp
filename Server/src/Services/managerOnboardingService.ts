// @ts-nocheck
import { and, eq, sql } from 'drizzle-orm';
import { InvestorOnboardingTable } from '../db/schema/onboarding';
import { UsersTable } from '../db/schema/Admin';
import {
  InvestorListItem,
  PaginatedResponse,
  UpdateOnboardingStatusRequest,
} from '../dtos/managerOnboardingDTOs';
import { db } from '../db/DbConnection';
import { on } from 'events';

export async function getInvestorsList(
  page: number,
  limit: number,
  status?: 'pending' | 'approved' | 'rejected',
  fundManagerId?: string,
): Promise<PaginatedResponse<InvestorListItem>> {
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [eq(UsersTable.role, 'investor')];

  if (fundManagerId) {
    conditions.push(eq(UsersTable.referral, fundManagerId));
  }

  if (status) {
    conditions.push(eq(InvestorOnboardingTable.status, status));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [investors, totalCount] = await Promise.all([
    db
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
        onboardingStatus: InvestorOnboardingTable.status,
        createdAt: InvestorOnboardingTable.createdAt,
        lastLoginAt: UsersTable.lastLoginAt,
        status: InvestorOnboardingTable.status,
      })
      .from(UsersTable)
      .innerJoin(InvestorOnboardingTable, eq(UsersTable.id, InvestorOnboardingTable.userId))
      .where(whereClause)
      .orderBy(sql`${InvestorOnboardingTable.updatedAt} DESC`)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(UsersTable)
      .innerJoin(InvestorOnboardingTable, eq(UsersTable.id, InvestorOnboardingTable.userId))
      .where(whereClause),
  ]);

  const total = Number(totalCount[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    data: investors.map((inv) => ({
      ...inv,
      createdAt: inv.createdAt ?? new Date(0),
    })),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getInvestorOnboardingDetails(investorId: string) {
  const details = await db
    .select({
      ...InvestorOnboardingTable,
      userName: UsersTable.name,
      userEmail: UsersTable.email,
    })
    .from(InvestorOnboardingTable)
    .innerJoin(UsersTable, eq(InvestorOnboardingTable.userId, UsersTable.id))
    .where(eq(InvestorOnboardingTable.userId, investorId));
  if (!details.length) {
    throw new Error('Investor onboarding details not found');
  }

  return details[0];
}

export async function updateOnboardingStatus(
  onboardingId: string,
  data: UpdateOnboardingStatusRequest,
) {
  const result = await db.transaction(async (tx) => {
    // Fetch existing onboarding to access formData
    const [existing] = await tx
      .select({ formData: InvestorOnboardingTable.formData })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.userId, onboardingId));

    if (!existing) {
      throw new Error('Onboarding record not found');
    }

    // Update onboarding status
    const [onboarding] = await tx
      .update(InvestorOnboardingTable)
      .set({
        status: data.status,
        rejectionNote: data.rejectionNote,
        // ✅ if approved, also update documentStatus
        formData:
          data.status === 'approved'
            ? {
                ...existing.formData,
                documentStatus: 'approved',
                documentNote: null,
              }
            : existing.formData,
        updatedAt: new Date(),
      })
      .where(eq(InvestorOnboardingTable.userId, onboardingId))
      .returning();

    // If status is rejected, update user's isOnboarded to false
    if (data.status === 'rejected') {
      await tx
        .update(UsersTable)
        .set({
          isOnboarded: false,
          updatedAt: new Date(),
        })
        .where(eq(UsersTable.id, onboardingId));
    }

    return onboarding;
  });

  return result;
}

export async function deleteInvestorOnboarding(onboardingId: string) {
  return await db.transaction(async (tx) => {
    // Get current onboarding status before deleting
    const [currentOnboarding] = await tx
      .select({ status: InvestorOnboardingTable.status })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.userId, onboardingId));

    // Delete the onboarding record
    const [deletedOnboarding] = await tx
      .delete(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.userId, onboardingId))
      .returning();

    await tx
      .update(UsersTable)
      .set({
        isOnboarded: false,
        updatedAt: new Date(),
      })
      .where(eq(UsersTable.id, onboardingId));

    return deletedOnboarding;
  });
}
