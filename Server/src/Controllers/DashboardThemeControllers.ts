import { Request, Response } from 'express';
import { ThemeService, ThemeUpdateRequest } from '../Services/ThemesServices';

/**
 * @swagger
 * components:
 *   schemas:
 *     Theme:
 *       type: object
 *       required:
 *         - dashboardBackground
 *         - cardBackground
 *         - primaryText
 *         - secondaryText
 *         - sidebarAccentText
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Theme unique identifier
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the theme
 *         name:
 *           type: string
 *           description: Theme name
 *         dashboardBackground:
 *           type: string
 *           description: Dashboard background color (hex/rgb)
 *         cardBackground:
 *           type: string
 *           description: Card background color (hex/rgb)
 *         primaryText:
 *           type: string
 *           description: Primary text color (hex/rgb)
 *         secondaryText:
 *           type: string
 *           description: Secondary text color (hex/rgb)
 *         sidebarAccentText:
 *           type: string
 *           description: Sidebar accent text color (hex/rgb)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         selectedTheme:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Currently selected theme ID
 *     ThemeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         selectedTheme:
 *           $ref: '#/components/schemas/Theme'
 *         error:
 *           type: string
 */

export class ThemeController {
  private readonly themeService = new ThemeService();

  /**
   * @swagger
   * /dashboard/theme/createTheme:
   *   post:
   *     summary: Create a new theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - dashboardBackground
   *               - cardBackground
   *               - primaryText
   *               - secondaryText
   *               - sidebarAccentText
   *             properties:
   *               name:
   *                 type: string
   *               dashboardBackground:
   *                 type: string
   *                 example: "#ffffff"
   *               cardBackground:
   *                 type: string
   *                 example: "#f8f9fa"
   *               primaryText:
   *                 type: string
   *                 example: "#000000"
   *               secondaryText:
   *                 type: string
   *                 example: "#6c757d"
   *               sidebarAccentText:
   *                 type: string
   *                 example: "#2FB5B4"
   *     responses:
   *       200:
   *         description: Theme created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ThemeResponse'
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  create = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.themeService.create(req.body, userId);

    res.status(200).json({
      success: true,
      message: 'Theme Created successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/theme/updateTheme/{id}:
   *   put:
   *     summary: Update an existing theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Theme ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               colors:
   *                 type: object
   *     responses:
   *       200:
   *         description: Theme updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ThemeResponse'
   */
  update = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.themeService.update(id, req.body, userId);
    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/theme/deleteTheme/{id}:
   *   delete:
   *     summary: Delete a theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Theme ID
   *     responses:
   *       200:
   *         description: Theme deleted successfully
   */
  delete = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    await this.themeService.delete(id, userId);
    res.status(200).json({
      success: true,
      message: 'Theme Deleted successfully',
    });
  };

  /**
   * @swagger
   * /dashboard/theme/getTheme/{id}:
   *   get:
   *     summary: Get a theme by ID
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Theme ID
   *     responses:
   *       200:
   *         description: Theme fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ThemeResponse'
   */
  getThemeById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.themeService.getById(id, userId);
    res.status(200).json({
      success: true,
      message: 'Theme Fetched successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/theme/listThemes:
   *   get:
   *     summary: Get all themes for the current user
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Themes fetched successfully
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
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Theme'
   */
  listSpecificUserThemes = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.themeService.list(userId);
    res.status(200).json({
      success: true,
      message: 'Theme Fetched successfully',
      data: result,
    });
  };

  /**
   * @swagger
   * /dashboard/theme/applyTheme:
   *   post:
   *     summary: Apply a theme for the current user
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - themeId
   *             properties:
   *               themeId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Theme applied successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Theme updated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     selectedThemeId:
   *                       type: string
   *                       format: uuid
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Theme ID is required"
   *       401:
   *         description: Authentication error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Authentication required"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */

  /**
   * @swagger
   * /dashboard/theme/selectedTheme:
   *   post:
   *     summary: Get the currently selected theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - themeId
   *             properties:
   *               themeId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Selected theme fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 selectedTheme:
   *                   $ref: '#/components/schemas/Theme'
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Selected theme not found"
   *       401:
   *         description: Authentication error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Theme ID is required"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Internal server error while fetching theme"
   */
  applyTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      const { themeId } = req.body;
      const userId = req.user?.id; // Assuming you have auth middleware that sets req.user

      // Validate request
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      if (!themeId) {
        res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
        return;
      }

      const request: ThemeUpdateRequest = {
        userId,
        themeId,
      };

      const result = await this.themeService.updateSelectedTheme(request);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          selectedThemeId: result.selectedTheme,
        },
      });
    } catch (error) {
      console.error('ThemeController - applyTheme error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * @swagger
   * /dashboard/theme/selectedTheme:
   *   post:
   *     summary: Get the currently selected theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               themeId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Selected theme fetched successfully
   */
  getSelectedTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      const { themeId } = req.body;

      if (!themeId) {
        res.status(401).json({
          success: false,
          error: 'Theme ID is required',
        });
        return;
      }

      const result = await this.themeService.getSelectedTheme(themeId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        selectedTheme: result.selectedTheme,
      });
    } catch (error) {
      console.error('ThemeController - getSelectedTheme error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * @swagger
   * /dashboard/theme/clearSelectedTheme:
   *   delete:
   *     summary: Clear the currently selected theme
   *     tags: [Themes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Theme selection cleared successfully
   */
  clearSelectedTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await this.themeService.clearSelectedTheme(userId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('ThemeController - clearSelectedTheme error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}
