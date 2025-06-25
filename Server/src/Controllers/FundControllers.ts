import { NextFunction, Request, Response } from 'express';
import FundService from '../Services/FundServices';
import { FundCreationUpdateHelper } from '../Utils/FundCreationUpdatehelper';

export default class FundController {
  // Backend Controller Fix
  static async createFund(req: Request, res: Response): Promise<Response> {
    try {
      let userRole = req.user?.role as string;
      const fundManagerId = req.user?.id as string;
      const isFundManager = userRole === 'fundManager';
      const isAdmin = userRole === 'admin';
      if (!isFundManager && !isAdmin) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to create funds.',
          403,
        );
      }
      // Extract and validate request data
      const { parsedBody, validationError } = FundCreationUpdateHelper.parseRequestBody(
        req.body?.data,
      );

      if (validationError) {
        return FundCreationUpdateHelper.sendErrorResponse(res, validationError, 400);
      }

      // Validate investors array
      const investorsValidationError = FundCreationUpdateHelper.validateInvestors(
        parsedBody.investors,
      );
      if (investorsValidationError) {
        return FundCreationUpdateHelper.sendErrorResponse(res, investorsValidationError, 400);
      }

      // Process uploaded files
      const { fundDocuments, investorDocumentMap } = FundCreationUpdateHelper.processUploadedFiles(
        req.files as Express.MulterS3.File[],
      );

      // Build fund data
      const fundData = FundCreationUpdateHelper.buildFundData(
        parsedBody,
        fundDocuments,
        fundManagerId,
        investorDocumentMap,
      );

      // Create fund
      await FundService.create(fundData);

      return FundCreationUpdateHelper.sendSuccessResponse(res, 'Fund created successfully', 201);
    } catch (error) {
      console.error('FundController.createFund Error:', error);
      return FundCreationUpdateHelper.sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'An unknown error occurred during fund creation.',
        500,
      );
    }
  }

  static async updateFund(req: Request, res: Response): Promise<Response> {
    try {
      let userRole = req.user?.role as string;
      const isFundManager = userRole === 'fundManager';
      const isAdmin = userRole === 'admin';

      if (!isFundManager && !isAdmin) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to update funds.',
          403,
        );
      }

      // Validate fund ID
      const fundId = req.params?.id;
      if (!fundId) {
        return FundCreationUpdateHelper.sendErrorResponse(res, 'Missing fund ID in URL path.', 400);
      }

      // Check if fund exists
      const existingFund = await FundService.findById(fundId);
      if (!existingFund) {
        return FundCreationUpdateHelper.sendErrorResponse(res, 'Fund not found.', 404);
      }

      // Parse request body
      const { parsedBody, validationError } = FundCreationUpdateHelper.parseRequestBody(
        req.body?.data || req.body,
      );
      if (validationError) {
        return FundCreationUpdateHelper.sendErrorResponse(res, validationError, 400);
      }
      console.log('parsedBody', parsedBody);
      console.log('existingFund', req.files);
      // Process uploaded files
      const { fundDocuments, investorDocumentMap } = FundCreationUpdateHelper.processUploadedFiles(
        req.files as Express.MulterS3.File[],
      );

      // Get S3 bucket name from environment variables
      const s3BucketName = process.env.BUCKET_NAME;
      if (!s3BucketName) {
        console.warn(
          'AWS_S3_BUCKET_NAME not found in environment variables. S3 cleanup will be skipped.',
        );
      }

      // Build update data with S3 cleanup (if bucket name is available)
      let updateData;
      if (s3BucketName) {
        updateData = await FundCreationUpdateHelper.buildUpdateDataWithCleanup(
          parsedBody,
          existingFund,
          fundDocuments,
          investorDocumentMap,
          s3BucketName,
        );
      } else {
        // Fallback to legacy method without S3 cleanup
        updateData = FundCreationUpdateHelper.buildUpdateData(
          parsedBody,
          existingFund,
          fundDocuments,
          investorDocumentMap,
        );
      }
      console.log('updateData', updateData);
      // Update fund in database
      await FundService.update(fundId, updateData);

      return FundCreationUpdateHelper.sendSuccessResponse(res, 'Fund updated successfully', 200);
    } catch (error) {
      console.error('FundController.updateFund Error:', error);
      return FundCreationUpdateHelper.sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'An unknown error occurred during fund update.',
        500,
      );
    }
  }
  static async getAllFunds(req: Request, res: Response) {
    const result = await FundService.getAll();

    res.json({ data: result, success: true, message: 'All Funds fetched successfully' });
  }
  static async getAllFundsSpecificData(req: Request, res: Response) {
    try {
      const fundManagerId = req.user?.id;
      let userRole = req.user?.role as string;
      const isFundManager = userRole === 'fundManager';
      const isAdmin = userRole === 'admin';
      if (!isFundManager && !isAdmin) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to get funds.',
          403,
        );
      }
      if (!fundManagerId) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to get funds you are unauthorized.',
          401,
        );
      }

      const result = await FundService.getSpecific(fundManagerId);

      res.json({ data: result, success: true, message: 'Funds fetched successfully' });
    } catch (error) {
      console.error('Error fetching manager-specific funds:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async getFundById(req: Request, res: Response) {
    const fundId = req.params?.id;
    const result = await FundService.getById(fundId || '');
    res.json({ result, success: true, message: 'Fund info fetched successfully' });
  }

  static async getManagerFunds(req: Request, res: Response) {
    let userRole = req.user?.role as string;
    const isFundManager = userRole === 'fundManager';
    const isAdmin = userRole === 'admin';
    if (!isFundManager && !isAdmin) {
      return FundCreationUpdateHelper.sendErrorResponse(
        res,
        'You are not allowed to get funds.',
        403,
      );
    }
    const result = await FundService.getByManagerId(req.params.managerId);
    res.json({ data: result, success: true, message: 'Funds fetched successfully' });
  }

  static async getInvestorsByManager(req: Request, res: Response) {
    try {
      let userRole = req.user?.role as string;
      const isFundManager = userRole === 'fundManager';
      const isAdmin = userRole === 'admin';
      if (!isFundManager && !isAdmin) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to get investors.',
          403,
        );
      }
      const fundManagerId = req.user?.id;
      if (!fundManagerId) {
        return res.status(400).json({ message: 'Unauthorized', success: false });
      }

      const investors = await FundService.getInvestorsByFundManager(fundManagerId);
      res.status(200).json({ data: investors, success: true });
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: 'Failed to fetch investors', error: error.message, success: false });
      } else {
        res
          .status(500)
          .json({ message: 'Failed to fetch investors', error: 'Unknown error', success: false });
      }
    }
  }

  static async deleteFund(req: Request, res: Response) {
    try {
      let userRole = req.user?.role as string;
      const isFundManager = userRole === 'fundManager';
      const isAdmin = userRole === 'admin';
      if (!isFundManager && !isAdmin) {
        return FundCreationUpdateHelper.sendErrorResponse(
          res,
          'You are not allowed to delete funds.',
          403,
        );
      }
      const result = await FundService.delete(req.params.id);
      res.json({ data: result, message: 'Fund deleted successfully', success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete fund', success: false });
    }
  }
  static async getInvestorAllFunds(req: Request, res: Response): Promise<Response> {
    try {
      const investorId = req.user?.id as string;

      if (!investorId) {
        return FundCreationUpdateHelper.sendErrorResponse(res, 'Missing investorId in query', 400);
      }

      const data = await FundService.getAllFundsForInvestor(investorId);

      return FundCreationUpdateHelper.sendSuccessResponse(
        res,
        'Fetched funds for investor',
        200,
        data,
      );
    } catch (error) {
      console.error('getAllInvestorFunds Error:', error);
      return FundCreationUpdateHelper.sendErrorResponse(res, 'Failed to fetch investor funds', 500);
    }
  }
}
