import { db } from '../db/DbConnection';
import { InvestorOnboardingTable } from '../db/schema/onboarding';
import { eq } from 'drizzle-orm';
import {
  CreateOnboardingRequest,
  UpdateOnboardingRequest,
  OnboardingStatusResponse,
} from '../dtos/OnboardingDTOs';
import { UsersTable } from '../db/schema';

export const startOnboarding = async (userId: string, payload: CreateOnboardingRequest) => {
  // Insert onboarding row (if not exists), otherwise throw/conflict
  const [existing] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (existing) throw new Error('Onboarding already started.');

  const [created] = await db
    .insert(InvestorOnboardingTable)
    .values({
      userId,
      formData: payload?.formData,
      status: 'pending',
    })
    .returning();

  return created;
};

export const updateOnboarding = async (userId: string, payload: UpdateOnboardingRequest) => {
  // Update onboarding data for this user
  const [existing] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (!existing) throw new Error('Onboarding not found.');

  const [updated] = await db
    .update(InvestorOnboardingTable)
    .set({
      formData: {
        ...(typeof existing.formData === 'object' && existing.formData !== null
          ? existing.formData
          : {}),
        ...(typeof payload.formData === 'object' && payload.formData !== null
          ? payload.formData
          : {}),
      },
      status: 'pending', // Reset status to pending as user has updated , would be under review
      rejectionNote: null, // Clear rejection note
      updatedAt: new Date(),
    })
    .where(eq(InvestorOnboardingTable.userId, userId))
    .returning();

  return updated;
};

export const getOnboardingStatus = async (userId: string): Promise<OnboardingStatusResponse> => {
  const [onboarding] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (!onboarding) throw new Error('Onboarding not found.');

  return {
    status: onboarding.status,
    rejectionNote: onboarding.rejectionNote ?? undefined,
  };
};

export const getOnboardingInfo = async (userId: string) => {
  const [onboarding] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (!onboarding) throw new Error('Onboarding not found.');

  return {
    ...onboarding,
  };
};

export const proceedOnboarding = async (userId: string) => {
  // Update user's onboarding status
  const [updated] = await db
    .update(UsersTable)
    .set({
      isOnboarded: true,
      updatedAt: new Date(),
    })
    .where(eq(UsersTable.id, userId))
    .returning();

  if (!updated) {
    throw new Error('User not found');
  }

  return updated;
};
