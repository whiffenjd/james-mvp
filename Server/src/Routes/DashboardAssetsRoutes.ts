import express from 'express';
import { WebsiteAssetController } from '../Controllers/DashboardAssetsController';
import { verifyToken } from '../Middlewares/VerifyToken';
import { upload } from '../Middlewares/MulterS3Upload';

const DashboardAssetRouter = express.Router();
const assetController = new WebsiteAssetController();

DashboardAssetRouter.post(
  '/upsert-website-assets',
  verifyToken,
  upload.single('logo'),
  assetController.upsert as unknown as express.RequestHandler,
);
DashboardAssetRouter.get(
  '/get-website-assets',
  verifyToken,
  assetController.get as unknown as express.RequestHandler,
);
DashboardAssetRouter.delete(
  '/delete-website-assets',
  verifyToken,
  assetController.delete as unknown as express.RequestHandler,
);

export default DashboardAssetRouter;
