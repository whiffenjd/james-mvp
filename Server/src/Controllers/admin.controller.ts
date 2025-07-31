import { Request, Response } from 'express';
import * as AdminService from '../Services/admin.service';
import { sendSuccessResponse, sendErrorResponse } from '../Utils/response';

export const checkSubdomain = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }
    const { subdomain } = req.query;
    if (!subdomain || typeof subdomain !== 'string') {
      return sendErrorResponse(res, 'Subdomain is required and must be a string', 400);
    }

    const isAvailable = await AdminService.checkSubdomain(subdomain);
    return sendSuccessResponse(res, 'Subdomain availability checked', 200, {
      subdomain,
      isAvailable,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to check subdomain',
      500,
    );
  }
};

export const createFundManager = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }

    const { name, email, password, subdomain } = req.body;
    if (!name || !email || !password || !subdomain) {
      return sendErrorResponse(res, 'Name, email, password, and subdomain are required', 400);
    }

    const fundManager = await AdminService.createFundManager({ name, email, password, subdomain });
    return sendSuccessResponse(res, 'Fund manager created successfully', 201, fundManager);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create fund manager',
      500,
    );
  }
};
export const getFundManagers = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, totalItems, totalPages } = await AdminService.getFundManagers(page, limit);
    return sendSuccessResponse(res, 'Fund managers retrieved successfully', 200, {
      data,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve fund managers',
      500,
    );
  }
};

export const deleteFundManager = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }

    const { id } = req.params;
    await AdminService.deleteFundManager(id);
    return sendSuccessResponse(res, 'Fund manager deleted successfully', 200);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete fund manager',
      500,
    );
  }
};

export const getInvestors = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, totalItems, totalPages } = await AdminService.getInvestors(page, limit);
    return sendSuccessResponse(res, 'Investors retrieved successfully', 200, {
      data,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve investors',
      500,
    );
  }
};

export const deleteInvestor = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return sendErrorResponse(res, 'Only admins can access this route', 403);
    }

    const { id } = req.params;
    await AdminService.deleteInvestor(id);
    return sendSuccessResponse(res, 'Investor deleted successfully', 200);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete investor',
      500,
    );
  }
};
