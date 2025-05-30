import { db } from '../db/DbConnection';
import { InvestorOnboardingTable, OnboardingDocumentTable } from '../db/schema/onboarding';
import { eq } from 'drizzle-orm';
import {
  CreateOnboardingRequest,
  UpdateOnboardingRequest,
  OnboardingStatusResponse,
} from '../dtos/OnboardingDTOs';

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

  const documents = await db
    .select()
    .from(OnboardingDocumentTable)
    .where(eq(OnboardingDocumentTable.onboardingId, onboarding.id));

  return {
    status: onboarding.status,
    rejectionNote: onboarding.rejectionNote ?? undefined,
  };
};
