import { Request, Response } from 'express';
import { ThemeService, ThemeUpdateRequest } from '../Services/ThemesServices';

export class ThemeController {
  private readonly themeService = new ThemeService();

  create = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const result = await this.themeService.create(req.body, userId);
    console.log(result);
    res.status(200).json({
      success: true,
      message: 'Theme Created successfully',
      data: result,
    });
  };

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
   * Get user's currently selected theme
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
   * Clear user's selected theme
   * DELETE /api/themes/selected
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
