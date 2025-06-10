import { Request, Response } from 'express';
import * as managerOnboardingService from '../Services/managerOnboardingService';
import { PaginationQuerySchema, UpdateOnboardingStatusSchema } from '../dtos/managerOnboardingDTOs';

/**
 * @swagger
 * components:
 *   schemas:
 *     InvestorListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         onboardingStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedInvestorResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvestorListItem'
 *         total:
 *           type: number
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *         totalPages:
 *           type: number
 *
 *     UpdateOnboardingStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         rejectionNote:
 *           type: string
 */

/**
 * @swagger
 * /list/investors:
 *   get:
 *     summary: Get paginated list of investors
 *     tags: [Fund Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved investors list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedInvestorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not a fund manager
 *
 * /list/investors/{investorId}:
 *   get:
 *     summary: Get detailed investor onboarding information
 *     tags: [Fund Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The investor's unique identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved investor details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/InvestorOnboardingPayload'
 *
 * /list/onboarding/{onboardingId}/status:
 *   put:
 *     summary: Update investor onboarding status
 *     tags: [Fund Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: onboardingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The onboarding record's unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOnboardingStatusRequest'
 *     responses:
 *       200:
 *         description: Successfully updated onboarding status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *
 * /list/onboarding/{onboardingId}:
 *   delete:
 *     summary: Delete an investor onboarding record
 *     tags: [Fund Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: onboardingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The onboarding record's unique identifier
 *     responses:
 *       200:
 *         description: Successfully deleted onboarding record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 */

export async function getInvestorsList(req: Request, res: Response) {
  try {
    const { page, limit, status } = PaginationQuerySchema.parse(req.query);
    const investors = await managerOnboardingService.getInvestorsList(page, limit, status);

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
      data: updated,
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
