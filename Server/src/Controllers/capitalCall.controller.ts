import { Request, Response } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../Utils/response';
import {
  CapitalCallCreateSchema,
  CapitalCallStatusUpdateSchema,
  CapitalCallUpdateSchema,
} from '../validators/capitalCall.schema';
import * as CapitalCallService from '../Services/capitalCall.service';

export const create = async (req: Request, res: Response) => {
  try {
    const { role, id: createdBy } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can create capital calls', 403);
    }

    const parsed = CapitalCallCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const data = { ...parsed.data, createdBy };
    const capitalCall = await CapitalCallService.create(data);
    return sendSuccessResponse(res, 'Capital call created successfully', 201, capitalCall);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create capital call',
      500,
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const fundId = req.query.fundId as string | undefined; // Get fundId from query params
    const { data, totalItems, totalPages } = await CapitalCallService.getAllForUser(
      userId,
      role,
      page,
      limit,
      fundId,
    );
    return sendSuccessResponse(res, 'Capital calls retrieved successfully', 200, {
      data,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve capital calls',
      500,
    );
  }
};
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'investor') {
      return sendErrorResponse(res, 'Only investors can update capital call status', 403);
    }

    const parsed = CapitalCallStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { id } = req.params;
    const { status } = parsed.data;
    const capitalCall = await CapitalCallService.updateStatus(id, status, userId);
    return sendSuccessResponse(res, 'Capital call status updated successfully', 200, capitalCall);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update capital call status',
      500,
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== 'fundManager') {
      return sendErrorResponse(res, 'Only fund managers can update capital calls', 403);
    }

    const parsed = CapitalCallUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendErrorResponse(res, parsed.error.message, 400);
    }

    const { id } = req.params;
    const capitalCall = await CapitalCallService.update(id, parsed.data, userId);
    return sendSuccessResponse(res, 'Capital call updated successfully', 200, capitalCall);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update capital call',
      500,
    );
  }
};
