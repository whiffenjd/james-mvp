import { Request, Response } from 'express';
import { WebsiteAssetService } from '../Services/DashboardAssets';

/**
 * @swagger
 * components:
 *   schemas:
 *     WebsiteAsset:
 *       type: object
 *       properties:
 *         logoUrl:
 *           type: string
 *           description: URL of the uploaded logo
 *         projectName:
 *           type: string
 *           description: Name of the project
 *         projectDescription:
 *           type: string
 *           description: Description of the project
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

export class WebsiteAssetController {
  private readonly service = new WebsiteAssetService();

  /**
   * @swagger
   * /dashboard/upsert-website-assets:
   *   post:
   *     summary: Create or update website assets
   *     tags: [Dashboard Assets]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               logo:
   *                 type: string
   *                 format: binary
   *                 description: Logo file to upload
   *               projectName:
   *                 type: string
   *                 description: Name of the project
   *               projectDescription:
   *                 type: string
   *                 description: Description of the project
   *     responses:
   *       200:
   *         description: Assets updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: User not found or invalid input
   *       401:
   *         description: Unauthorized
   */
  upsert = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const { projectName, projectDescription } = req.body;
    const logoUrl = (req.file as any).location;
    const result = await this.service.upsert({ logoUrl, projectName, projectDescription }, userId);
    res.status(200).json({
      success: true,
      message: 'Assets Updated successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/get-website-assets:
   *   get:
   *     summary: Get website assets for the authenticated user
   *     tags: [Dashboard Assets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Assets fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/WebsiteAsset'
   *       400:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  get = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.service.get(userId);
    res.status(200).json({
      success: true,
      message: 'Assets Fetched successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/delete-website-assets:
   *   delete:
   *     summary: Delete website assets for the authenticated user
   *     tags: [Dashboard Assets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Assets deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  delete = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    await this.service.delete(userId);
    res.status(200).send({
      success: true,
      message: 'Assets Deleted successfully',
    });
  };
}
