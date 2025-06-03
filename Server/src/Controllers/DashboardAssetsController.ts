import { Request, Response } from 'express';
import { WebsiteAssetService } from '../Services/DashboardAssets';

export class WebsiteAssetController {
  private readonly service = new WebsiteAssetService();

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
