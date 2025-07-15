import { Request, Response } from 'express';
import {
  DistributionCreateSchema,
  DistributionStatusUpdateSchema,
  DistributionUpdateSchema,
} from '../validators/distributions.schema';
import * as DistributionService from '../Services/distributions.service';
import { sendSuccessResponse, sendErrorResponse } from '../Utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const { role, id: createdBy } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can create distributions', 403);
    }

    const parsed = DistributionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const data = { ...parsed.data, createdBy };
    const distribution = await DistributionService.create(data);
    return sendSuccessResponse(res, 'Distribution created successfully', 201, distribution);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create distribution',
      500,
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const fundId = req.query.fundId as string | undefined;
    const { data, totalItems, totalPages } = await DistributionService.getAllForUser(
      userId,
      role,
      page,
      limit,
      fundId,
    );
    return sendSuccessResponse(res, 'Distributions retrieved successfully', 200, {
      data,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve distributions',
      500,
    );
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'investor') {
      return sendErrorResponse(res, 'Only investors can update distribution status', 403);
    }

    const parsed = DistributionStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { id } = req.params;
    const { status } = parsed.data;
    const distribution = await DistributionService.updateStatus(id, status, userId);
    return sendSuccessResponse(res, 'Distribution status updated successfully', 200, distribution);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update distribution status',
      500,
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can update distributions', 403);
    }

    const parsed = DistributionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { id } = req.params;
    const distribution = await DistributionService.update(id, parsed.data, userId);
    return sendSuccessResponse(res, 'Distribution updated successfully', 200, distribution);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update distribution',
      500,
    );
  }
};
