import { Request, Response } from 'express';
import * as managerOnboardingService from '../Services/managerOnboardingService';
import { PaginationQuerySchema, UpdateOnboardingStatusSchema } from '../dtos/managerOnboardingDTOs';

export async function getInvestorsList(req: Request, res: Response) {
  try {
    const { page, limit } = PaginationQuerySchema.parse(req.query);
    const investors = await managerOnboardingService.getInvestorsList(page, limit);

    return res.status(200).json({
      success: true,
      message: 'Investors list fetched successfully',
      data: investors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

export async function getInvestorDetails(req: Request, res: Response) {
  try {
    const { investorId } = req.params;
    const details = await managerOnboardingService.getInvestorOnboardingDetails(investorId);

    return res.status(200).json({
      success: true,
      message: 'Investor details fetched successfully',
      data: details,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Investor not found',
      data: null,
    });
  }
}

export async function updateOnboardingStatus(req: Request, res: Response) {
  try {
    const { onboardingId } = req.params;
    const payload = UpdateOnboardingStatusSchema.parse(req.body);

    const updated = await managerOnboardingService.updateOnboardingStatus(onboardingId, payload);

    return res.status(200).json({
      success: true,
      message: 'Onboarding status updated successfully',
      data: updated[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}

export async function deleteOnboarding(req: Request, res: Response) {
  try {
    const { onboardingId } = req.params;
    await managerOnboardingService.deleteInvestorOnboarding(onboardingId);

    return res.status(200).json({
      success: true,
      message: 'Onboarding deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}
