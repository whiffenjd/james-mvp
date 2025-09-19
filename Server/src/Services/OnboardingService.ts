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
  const [existing] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (existing) throw new Error('Onboarding already started.');

  let documentStatus = 'pending_upload';
  if (payload.formData.investorType === 'individual') {
    if (payload.formData.kycDocumentUrl && payload.formData.proofOfAddressUrl) {
      documentStatus = 'submitted';
    }
  } else if (payload.formData.entityDocuments?.length) {
    documentStatus = 'submitted';
  }

  const [created] = await db
    .insert(InvestorOnboardingTable)
    .values({
      userId,
      formData: {
        ...payload.formData,
        documentStatus,
        documentNote: null,
      },
      status: 'pending',
    })
    .returning();

  return created;
};

export const updateOnboarding = async (userId: string, payload: UpdateOnboardingRequest) => {
  const [existing] = await db
    .select()
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.userId, userId));

  if (!existing) throw new Error('Onboarding not found.');

  let documentStatus = 'pending_upload';
  if (payload.formData.investorType === 'individual') {
    if (payload.formData.kycDocumentUrl && payload.formData.proofOfAddressUrl) {
      documentStatus = 'submitted';
    }
  } else if (payload.formData.entityDocuments?.length) {
    documentStatus = 'submitted';
  }

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
        documentStatus,
        documentNote: null,
      },
      status: 'pending',
      rejectionNote: null,
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
