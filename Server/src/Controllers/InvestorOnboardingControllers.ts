import { Request, Response } from 'express';
import * as onboardingService from '../Services/OnboardingService';
import { ApiResponse } from '../dtos/ApiResponse';
import { CreateOnboardingRequest, UpdateOnboardingRequest } from '../dtos/OnboardingDTOs';
import { JwtPayload } from '../Middlewares/VerifyToken';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     HighNetWorthQualification:
 *       type: object
 *       properties:
 *         incomeQualified:
 *           type: boolean
 *           description: Did you have £100,000+ income last year?
 *         incomeAmount:
 *           type: number
 *           description: Actual income amount
 *         netAssetsQualified:
 *           type: boolean
 *           description: Do you have £250,000+ net assets?
 *         netAssetsAmount:
 *           type: number
 *           description: Actual net assets amount
 *         noneApply:
 *           type: boolean
 *         declarationAccepted:
 *           type: boolean
 *
 *     SelfCertifiedSophisticatedInvestor:
 *       type: object
 *       properties:
 *         professionalCapacity:
 *           type: boolean
 *         professionalCapacityDetails:
 *           type: string
 *         director:
 *           type: boolean
 *         directorDetails:
 *           type: object
 *           properties:
 *             companyName:
 *               type: string
 *             companyNumber:
 *               type: string
 *         unlistedInvestments:
 *           type: boolean
 *         unlistedInvestmentsCount:
 *           type: number
 *         businessAngel:
 *           type: boolean
 *         businessAngelNetwork:
 *           type: string
 *         noneApply:
 *           type: boolean
 *         declarationAccepted:
 *           type: boolean
 *
 *     EntityDetails:
 *       type: object
 *       properties:
 *         entityType:
 *           type: string
 *           enum: [investment_professional, high_net_worth_company, other]
 *         entityName:
 *           type: string
 *         referenceNumber:
 *           type: string
 *         highNetWorthCompanySubType:
 *           type: string
 *           enum: [body_corporate_a, body_corporate_b, unincorporated_association, trustee_high_value, other_legal_person]
 *         bodyCorporateBDetails:
 *           type: object
 *           properties:
 *             entityName:
 *               type: string
 *             referenceNumber:
 *               type: string
 *         shareCapital:
 *           type: number
 *         netAssets:
 *           type: number
 *         membersCount:
 *           type: number
 *         trustAssetsValue:
 *           type: number
 *
 *     InvestorOnboardingPayload:
 *       type: object
 *       properties:
 *         jurisdiction:
 *           type: string
 *         investorType:
 *           type: string
 *           enum: [individual, entity]
 *         individualInvestorType:
 *           type: string
 *           enum: [high_net_worth, self_certified_sophisticated_investor]
 *         highNetWorthQualification:
 *           $ref: '#/components/schemas/HighNetWorthQualification'
 *         selfCertifiedSophisticatedInvestor:
 *           $ref: '#/components/schemas/SelfCertifiedSophisticatedInvestor'
 *         entityClassification:
 *           type: string
 *           enum: [investment_professional, high_net_worth_company, other]
 *         entityDetails:
 *           $ref: '#/components/schemas/EntityDetails'
 *         kycDocumentUrl:
 *           type: string
 *         proofOfAddressUrl:
 *           type: string
 *         entityDocuments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               url:
 *                 type: string
 *               fileName:
 *                 type: string
 *         declarationAccepted:
 *           type: boolean
 *         signature:
 *           type: string
 *         signatureDate:
 *           type: string
 *           format: date
 *         lastCompletedStep:
 *           type: string
 *
 *     CreateOnboardingRequest:
 *       type: object
 *       required:
 *         - formData
 *       properties:
 *         formData:
 *           $ref: '#/components/schemas/InvestorOnboardingPayload'
 *
 *     UpdateOnboardingRequest:
 *       type: object
 *       required:
 *         - formData
 *       properties:
 *         formData:
 *           $ref: '#/components/schemas/InvestorOnboardingPayload'
 *
 *     ApiResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: object
 *
 *     OnboardingStatusResponse:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Current status of the onboarding process
 *         rejectionNote:
 *           type: string
 *           description: Note explaining why the onboarding was rejected (if applicable)
 *
 */

/**
 * @swagger
 * /onboarding/investor/start:
 *   post:
 *     summary: Start the investor onboarding process
 *     tags: [Investor Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOnboardingRequest'
 *     responses:
 *       200:
 *         description: Onboarding process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
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

    // Extract and decode URLs from the request body
    const { formData, ...restPayload } = req.body;
    const decodedFormData = {
      ...formData,
      kycDocumentUrl: formData.kycDocumentUrl
        ? decodeURIComponent(formData.kycDocumentUrl.replace(/&#x2F;/g, '/'))
        : undefined,
      proofOfAddressUrl: formData.proofOfAddressUrl
        ? decodeURIComponent(formData.proofOfAddressUrl.replace(/&#x2F;/g, '/'))
        : undefined,
    };

    // Create new payload with decoded URLs
    const payload: CreateOnboardingRequest = {
      ...restPayload,
      formData: decodedFormData,
    };

    const onboarding = await onboardingService.startOnboarding(userId, payload);

    res.status(200).json({
      success: true,
      message: 'Onboarding started',
      data: onboarding,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
};

/**
 * @swagger
 * /onboarding/investor/update:
 *   put:
 *     summary: Update the investor onboarding information
 *     tags: [Investor Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOnboardingRequest'
 *     responses:
 *       200:
 *         description: Onboarding information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Onboarding not found
 *       500:
 *         description: Server error
 */
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

    // Extract and decode URLs from the request body
    const { formData, ...restPayload } = req.body;
    const decodedFormData = {
      ...formData,
      kycDocumentUrl: formData.kycDocumentUrl
        ? decodeURIComponent(formData.kycDocumentUrl.replace(/&#x2F;/g, '/'))
        : undefined,
      proofOfAddressUrl: formData.proofOfAddressUrl
        ? decodeURIComponent(formData.proofOfAddressUrl.replace(/&#x2F;/g, '/'))
        : undefined,
    };

    // Create new payload with decoded URLs
    const payload: UpdateOnboardingRequest = {
      ...restPayload,
      formData: decodedFormData,
    };

    const onboarding = await onboardingService.updateOnboarding(userId, payload);

    res.status(200).json({
      success: true,
      message: 'Onboarding updated',
      data: onboarding,
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      data: null,
    });
  }
};

/**
 * @swagger
 * /onboarding/investor/status:
 *   get:
 *     summary: Get the current status of investor onboarding
 *     tags: [Investor Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OnboardingStatusResponse'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Onboarding not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /onboarding/investor/info:
 *   get:
 *     summary: Get the complete onboarding information
 *     tags: [Investor Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         formData:
 *                           $ref: '#/components/schemas/InvestorOnboardingPayload'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Onboarding not found
 *       500:
 *         description: Server error
 */
export const getOnboardingInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const info = await onboardingService.getOnboardingInfo(userId);
    res.status(200).json({
      success: true,
      message: 'Onboarding information fetched',
      data: info,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Onboarding not found.') {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
};
