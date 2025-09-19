import { Request, Response } from 'express';
import { create, getByFund } from '../Services/fundReport.service';
import { CreateFundReportSchema } from '../validators/fundReport.schema';
import { sendSuccessResponse, sendErrorResponse } from '../Utils/response';
import { s3Upload } from '../Utils/s3Upload';

export const createFundReport = async (req: Request, res: Response) => {
  try {
    const { role, id: createdBy } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can create fund reports', 403);
    }

    if (!req.file) {
      return sendErrorResponse(res, 'Document file is required', 400);
    }

    const file = req.file;
    const documentUrl = await s3Upload(file, createdBy);
    const parsed = CreateFundReportSchema.safeParse({
      ...req.body,
      documentUrl,
      investorIds: req.body.investorIds ? JSON.parse(req.body.investorIds) : undefined, // Handle JSON string if sent
    });
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const data = { ...parsed.data, createdBy };
    const fundReport = await create(data);
    return sendSuccessResponse(res, 'Fund report created successfully', 201, fundReport);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create fund report',
      500,
    );
  }
};
export const getFundReportsByFund = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user!;
    const fundId = req.params.fundId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const year = req.query.year as string | undefined;
    const quarter = req.query.quarter as string | undefined;

    const { data, totalItems, totalPages, currentPage } = await getByFund(
      fundId,
      page,
      limit,
      year,
      quarter,
      userId,
      role,
    );
    return sendSuccessResponse(res, 'Fund reports retrieved successfully', 200, {
      results: data,
      totalCount: totalItems,
      totalPages,
      currentPage,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve fund reports',
      500,
    );
  }
};
