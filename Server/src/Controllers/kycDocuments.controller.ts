import { Request, Response } from 'express';
import {
  getKycDocuments as getKycDocumentsService,
  updateKycDocuments as updateKycService,
  approveKycDocuments as approveKycService,
  requestReupload as requestReuploadService,
  getDocumentDownloadUrl,
} from '../Services/kycDocuments.service';
import {
  GetKycDocumentsQuerySchema,
  UpdateKycDocumentsSchema,
  RequestReuploadSchema,
  DownloadDocumentSchema,
} from '../validators/kycDocuments.schema';
import { sendSuccessResponse, sendErrorResponse } from '../Utils/response';
import { db } from '../db/DbConnection';
import { InvestorOnboardingTable, UsersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getKycDocuments = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    const parsed = GetKycDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { page, limit, status, investorName } = parsed.data;
    let creatorId = userId;

    if (role === 'investor') {
      creatorId = userId; // Investors see only their own documents
    } else if (role === 'fundManager') {
      const investors = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.referral, userId));
      if (!investors.length) {
        return sendSuccessResponse(res, 'No investors found', 200, {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        });
      }
      creatorId = investors.map((i) => i.id); // Array of investor IDs
    } else if (role !== 'admin') {
      return sendErrorResponse(res, 'Unauthorized to view KYC documents', 403);
    }

    const kycDocuments = await getKycDocumentsService({
      creatorId,
      page,
      limit,
      status,
      investorName,
    });
    return sendSuccessResponse(res, 'KYC documents fetched successfully', 200, kycDocuments);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to fetch KYC documents',
      500,
    );
  }
};

export const updateKycDocuments = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'investor') {
      return sendErrorResponse(res, 'Only investors can update KYC documents', 403);
    }

    const { id } = req.params;
    const parsed = UpdateKycDocumentsSchema.safeParse({ id, ...req.body });
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { formData, ...restPayload } = parsed.data;

    // ✅ Decode URLs just like in startOnboarding
    const decodedFormData = {
      ...formData,
      kycDocumentUrl: formData.kycDocumentUrl
        ? decodeURIComponent(formData.kycDocumentUrl.replace(/&#x2F;/g, '/'))
        : undefined,
      proofOfAddressUrl: formData.proofOfAddressUrl
        ? decodeURIComponent(formData.proofOfAddressUrl.replace(/&#x2F;/g, '/'))
        : undefined,
      entityDocuments: formData.entityDocuments
        ? decodeDocumentUrls(formData.entityDocuments)
        : undefined,
    };

    const kycDocument = await updateKycService({
      ...restPayload,
      formData: decodedFormData,
      userId,
    });

    return sendSuccessResponse(res, 'KYC documents updated successfully', 200, kycDocument);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update KYC documents',
      500,
    );
  }
};
// Helper function to decode URLs
const decodeDocumentUrls = (documents: any[] = []) => {
  return documents.map((doc) => ({
    ...doc,
    url: doc.url ? decodeURIComponent(doc.url.replace(/&#x2F;/g, '/')) : undefined,
  }));
};

export const approveKycDocuments = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can approve KYC documents', 403);
    }

    const { id } = req.params;
    const kycDocument = await approveKycService(id, userId);
    return sendSuccessResponse(res, 'KYC documents approved successfully', 200, kycDocument);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to approve KYC documents',
      500,
    );
  }
};

export const requestReupload = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can request reupload', 403);
    }

    const { id } = req.params;
    const parsed = RequestReuploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const kycDocument = await requestReuploadService(id, userId, parsed.data.reuploadNote);
    return sendSuccessResponse(res, 'Reupload requested successfully', 200, kycDocument);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to request reupload',
      500,
    );
  }
};

export const downloadKycDocument = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    const { id, docType } = req.params;

    const parsed = DownloadDocumentSchema.safeParse({ docType });
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    if (role === 'investor' && id !== userId) {
      return sendErrorResponse(res, 'Unauthorized to download this document', 403);
    }
    if (role === 'fundManager') {
      const [onboarding] = await db
        .select({ userId: InvestorOnboardingTable.userId })
        .from(InvestorOnboardingTable)
        .where(eq(InvestorOnboardingTable.id, id));
      const [user] = await db
        .select({ referral: UsersTable.referral })
        .from(UsersTable)
        .where(eq(UsersTable.id, onboarding.userId));
      if (user.referral !== userId) {
        return sendErrorResponse(res, 'Unauthorized to download this document', 403);
      }
    } else if (role !== 'admin') {
      return sendErrorResponse(res, 'Unauthorized to download documents', 403);
    }

    const signedUrl = await getDocumentDownloadUrl(id, docType);
    return sendSuccessResponse(res, 'Download URL generated successfully', 200, { url: signedUrl });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to generate download URL',
      500,
    );
  }
};
