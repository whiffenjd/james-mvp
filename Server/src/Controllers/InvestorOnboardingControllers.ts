import { Request, Response } from 'express';
import * as onboardingService from '../Services/OnboardingService';
import { ApiResponse } from '../dtos/ApiResponse';
import { CreateOnboardingRequest, UpdateOnboardingRequest } from '../dtos/OnboardingDTOs';
import { JwtPayload } from '../Middlewares/VerifyToken';

// Define custom interface to include user property in Request
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const startOnboarding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const payload: CreateOnboardingRequest = req.body;
    const onboarding = await onboardingService.startOnboarding(userId, payload);
    res.status(200).json({
      success: true,
      message: 'Onboarding started',
      data: onboarding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
};

export const updateOnboarding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const payload: UpdateOnboardingRequest = req.body;
    const onboarding = await onboardingService.updateOnboarding(userId, payload);
    res.status(200).json({
      success: true,
      message: 'Onboarding updated',
      data: onboarding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
};

export const getOnboardingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const status = await onboardingService.getOnboardingStatus(userId);
    res.status(200).json({
      success: true,
      message: 'Onboarding status fetched',
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
};
