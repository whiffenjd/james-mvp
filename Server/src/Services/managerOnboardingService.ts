import { eq, sql } from 'drizzle-orm';
import { InvestorOnboardingTable, OnboardingDocumentTable } from '../db/schema/onboarding';
import { UsersTable } from '../db/schema/Admin';
import {
  InvestorListItem,
  PaginatedResponse,
  UpdateOnboardingStatusRequest,
} from '../dtos/managerOnboardingDTOs';
import { db } from '../db/DbConnection';

export async function getInvestorsList(
  page: number,
  limit: number,
): Promise<PaginatedResponse<InvestorListItem>> {
  const offset = (page - 1) * limit;

  const [investors, totalCount] = await Promise.all([
    db
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
        onboardingStatus: InvestorOnboardingTable.status,
        createdAt: InvestorOnboardingTable.createdAt,
      })
      .from(UsersTable)
      .innerJoin(InvestorOnboardingTable, eq(UsersTable.id, InvestorOnboardingTable.userId))
      .where(eq(UsersTable.role, 'investor'))
      .orderBy(sql`${InvestorOnboardingTable.updatedAt} DESC`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(UsersTable)
      .innerJoin(InvestorOnboardingTable, eq(UsersTable.id, InvestorOnboardingTable.userId))
      .where(eq(UsersTable.role, 'investor')),
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
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, investorId))
    .leftJoin(
      OnboardingDocumentTable,
      eq(InvestorOnboardingTable.id, OnboardingDocumentTable.onboardingId),
    );

  if (!details.length) {
    throw new Error('Investor onboarding details not found');
  }

  return details[0];
}

export async function updateOnboardingStatus(
  onboardingId: string,
  data: UpdateOnboardingStatusRequest,
) {
  return await db
    .update(InvestorOnboardingTable)
    .set({
      status: data.status,
      rejectionNote: data.rejectionNote,
      updatedAt: new Date(),
    })
    .where(eq(InvestorOnboardingTable.id, onboardingId))
    .returning();
}

export async function deleteInvestorOnboarding(onboardingId: string) {
  return await db
    .delete(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.id, onboardingId))
    .returning();
}
