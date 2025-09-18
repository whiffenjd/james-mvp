import { Request, Response } from 'express';
import {
  create,
  getTaxReports as getTaxReportsService,
  update,
  remove,
  getReportDownloadUrl,
} from '../Services/taxReport.service';
import {
  CreateTaxReportSchema,
  UpdateTaxReportSchema,
  GetTaxReportsQuerySchema,
} from '../validators/taxReport.schema';
import { sendSuccessResponse, sendErrorResponse } from '../Utils/response';
import { s3UploadDuplicate } from '../Utils/s3UploadDuplicate';
import { UsersTable } from '../db/schema';
import { db } from '../db/DbConnection';
import { eq } from 'drizzle-orm';

export const createTaxReport = async (req: Request, res: Response) => {
  try {
    const { role, id: createdBy } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can create tax reports', 403);
    }

    if (!req.file) {
      return sendErrorResponse(res, 'Document file is required', 400);
    }

    const file = req.file;
    const reportURL = await s3UploadDuplicate(file, createdBy, 'taxReports');
    const parsed = CreateTaxReportSchema.safeParse({
      ...req.body,
      reportURL,
      createdBy,
    });
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const taxReport = await create(parsed.data);
    return sendSuccessResponse(res, 'Tax report created successfully', 201, taxReport);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create tax report',
      500,
    );
  }
};

export const getTaxReports = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    const parsed = GetTaxReportsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { page, limit, year, quarter } = parsed.data;
    let creatorId = userId;

    if (role === 'investor') {
      const [user] = await db
        .select({ referral: UsersTable.referral })
        .from(UsersTable)
        .where(eq(UsersTable.id, userId));
      if (!user.referral) {
        return sendErrorResponse(res, 'No linked fund manager found', 403);
      }
      creatorId = user.referral;
    } else if (role !== 'fundManager' && role !== 'admin') {
      return sendErrorResponse(res, 'Unauthorized to view tax reports', 403);
    }

    const taxReports = await getTaxReportsService({ creatorId, page, limit, year, quarter });
    return sendSuccessResponse(res, 'Tax reports fetched successfully', 200, taxReports);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to fetch tax reports',
      500,
    );
  }
};

export const updateTaxReport = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can update tax reports', 403);
    }

    const { id } = req.params;
    let reportURL = req.body.reportURL;
    if (req.file) {
      reportURL = await s3UploadDuplicate(req.file, userId, 'taxReports');
    }

    const parsed = UpdateTaxReportSchema.safeParse({
      id,
      ...req.body,
      reportURL,
    });

    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const taxReport = await update({ ...parsed.data, createdBy: userId });
    return sendSuccessResponse(res, 'Tax report updated successfully', 200, taxReport);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update tax report',
      500,
    );
  }
};

export const deleteTaxReport = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can delete tax reports', 403);
    }

    const { id } = req.params;
    await remove(id, userId);
    return sendSuccessResponse(res, 'Tax report deleted successfully', 200);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete tax report',
      500,
    );
  }
};
export const downloadTaxReport = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { id } = req.params;

    const signedUrl = await getReportDownloadUrl(id);

    return sendSuccessResponse(res, 'Download URL generated successfully', 200, { url: signedUrl });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to generate download URL',
      500,
    );
  }
};
