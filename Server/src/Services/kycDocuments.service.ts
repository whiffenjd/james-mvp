import { db } from '../db/DbConnection';
import { InvestorOnboardingTable, UsersTable, userNotifications, activityLogs } from '../db/schema';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { UpdateKycDocumentsSchema, RequestReuploadSchema } from '../validators/kycDocuments.schema';
import { getDownloadUrl } from '../Utils/s3UploadDuplicate';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getKycDocuments = async ({
  creatorId,
  page,
  limit,
  status,
  investorName,
}: {
  creatorId: string | string[];
  page: number;
  limit: number;
  status?: string;
  investorName?: string;
}): Promise<PaginatedResponse<any>> => {
  const offset = (page - 1) * limit;
  const conditions = [];

  if (Array.isArray(creatorId)) {
    conditions.push(inArray(InvestorOnboardingTable.userId, creatorId));
  } else {
    conditions.push(eq(InvestorOnboardingTable.userId, creatorId));
  }
  if (status) {
    conditions.push(sql`${InvestorOnboardingTable.formData} ->> 'documentStatus' = ${status}`);
  }
  if (investorName) {
    conditions.push(ilike(UsersTable.name, `%${investorName}%`));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [documents, totalCount] = await Promise.all([
    db
      .select({
        id: InvestorOnboardingTable.id,
        userId: InvestorOnboardingTable.userId,
        formData: InvestorOnboardingTable.formData,
        createdAt: InvestorOnboardingTable.createdAt,
        updatedAt: InvestorOnboardingTable.updatedAt,
        investorName: UsersTable.name,
      })
      .from(InvestorOnboardingTable)
      .leftJoin(UsersTable, eq(InvestorOnboardingTable.userId, UsersTable.id))
      .where(whereClause)
      .orderBy(sql`${InvestorOnboardingTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(InvestorOnboardingTable)
      .leftJoin(UsersTable, eq(InvestorOnboardingTable.userId, UsersTable.id))
      .where(whereClause),
  ]);

  const total = Number(totalCount[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    data: documents,
    total,
    page,
    limit,
    totalPages,
  };
};

export const updateKycDocuments = async (data: { id: string; formData: any; userId: string }) => {
  return db.transaction(async (tx) => {
    const parsed = UpdateKycDocumentsSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const [existing] = await tx
      .select({ formData: InvestorOnboardingTable.formData })
      .from(InvestorOnboardingTable)
      .where(
        and(
          eq(InvestorOnboardingTable.id, data.id),
          eq(InvestorOnboardingTable.userId, data.userId),
        ),
      );

    if (!existing) {
      throw new Error('Onboarding record not found or unauthorized');
    }

    // Merge existing formData with new document URLs and status
    const updatedFormData = {
      ...existing.formData,
      ...data.formData,
      documentStatus: 'submitted',
      documentNote: null,
    };

    const [onboarding] = await tx
      .update(InvestorOnboardingTable)
      .set({
        formData: updatedFormData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(InvestorOnboardingTable.id, data.id),
          eq(InvestorOnboardingTable.userId, data.userId),
        ),
      )
      .returning();

    if (!onboarding) {
      throw new Error('Failed to update KYC documents');
    }

    // // Log activity (commented as requested)
    // await tx.insert(activityLogs).values({
    //   entityType: 'kyc_document',
    //   entityId: onboarding.id,
    //   action: 'updated',
    //   performedBy: data.userId,
    //   description: `Updated KYC documents for investor`,
    //   createdAt: new Date(),
    // });

    return onboarding;
  });
};

export const approveKycDocuments = async (id: string, fundManagerId: string) => {
  return db.transaction(async (tx) => {
    const [onboarding] = await tx
      .select({
        userId: InvestorOnboardingTable.userId,
        formData: InvestorOnboardingTable.formData,
      })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.id, id));

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    const [user] = await tx
      .select({ referral: UsersTable.referral })
      .from(UsersTable)
      .where(eq(UsersTable.id, onboarding.userId));

    if (user.referral !== fundManagerId) {
      throw new Error('Unauthorized to approve this document');
    }

    const updatedFormData = {
      ...onboarding.formData,
      documentStatus: 'approved',
      documentNote: null,
    };

    const [updated] = await tx
      .update(InvestorOnboardingTable)
      .set({
        formData: updatedFormData,
        updatedAt: new Date(),
      })
      .where(eq(InvestorOnboardingTable.id, id))
      .returning();

    // // Log activity (commented)
    // await tx.insert(activityLogs).values({
    //   entityType: 'kyc_document',
    //   entityId: id,
    //   action: 'approved',
    //   performedBy: fundManagerId,
    //   description: `Approved KYC documents`,
    //   createdAt: new Date(),
    // });

    return updated;
  });
};

export const requestReupload = async (id: string, fundManagerId: string, reuploadNote: string) => {
  return db.transaction(async (tx) => {
    const [onboarding] = await tx
      .select({
        userId: InvestorOnboardingTable.userId,
        formData: InvestorOnboardingTable.formData,
      })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.id, id));

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    const [user] = await tx
      .select({ referral: UsersTable.referral })
      .from(UsersTable)
      .where(eq(UsersTable.id, onboarding.userId));

    if (user.referral !== fundManagerId) {
      throw new Error('Unauthorized to request reupload');
    }

    const updatedFormData = {
      ...onboarding.formData,
      documentStatus: 'reupload_requested',
      documentNote: reuploadNote,
    };

    const [updated] = await tx
      .update(InvestorOnboardingTable)
      .set({
        formData: updatedFormData,
        updatedAt: new Date(),
      })
      .where(eq(InvestorOnboardingTable.id, id))
      .returning();

    // // Notify investor (commented)
    // await tx.insert(userNotifications).values({
    //   userId: onboarding.userId,
    //   activityLogId: id,
    //   isRead: false,
    //   isDeleted: false,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });

    return updated;
  });
};

export const getDocumentDownloadUrl = async (id: string, docType: string) => {
  const [onboarding] = await db
    .select({ formData: InvestorOnboardingTable.formData, userId: InvestorOnboardingTable.userId })
    .from(InvestorOnboardingTable)
    .where(eq(InvestorOnboardingTable.id, id));

  if (!onboarding) {
    throw new Error('Onboarding record not found');
  }

  let url: string | undefined;
  if (docType === 'kyc' && onboarding.formData.kycDocumentUrl) {
    url = onboarding.formData.kycDocumentUrl;
  } else if (docType === 'proofOfAddress' && onboarding.formData.proofOfAddressUrl) {
    url = onboarding.formData.proofOfAddressUrl;
  } else if (docType === 'entityDocument' && onboarding.formData.entityDocuments?.length) {
    url = onboarding.formData.entityDocuments[0].url; // First entity document
  }

  if (!url) {
    throw new Error('Document not found');
  }

  const key = new URL(url).pathname.substring(1);
  const [user] = await db
    .select({ name: UsersTable.name })
    .from(UsersTable)
    .where(eq(UsersTable.id, onboarding.userId));
  const filename = `${user.name}-${docType}.pdf`;

  return await getDownloadUrl(key, filename);
};
