import express from 'express';
import { ThemeController } from '../Controllers/DashboardThemeControllers';
import { verifyToken } from '../Middlewares/VerifyToken';

const DashboardThemeRouter = express.Router();
const themeController = new ThemeController();

DashboardThemeRouter.post(
  '/createTheme',
  verifyToken,
  themeController.create as unknown as express.RequestHandler,
);
DashboardThemeRouter.put(
  '/updateTheme/:id',
  verifyToken,
  themeController.update as unknown as express.RequestHandler,
);
DashboardThemeRouter.delete(
  '/deleteTheme/:id',
  verifyToken,
  themeController.delete as unknown as express.RequestHandler,
);
DashboardThemeRouter.get(
  '/getTheme/:id',
  verifyToken,
  themeController.getById as unknown as express.RequestHandler,
);
DashboardThemeRouter.get(
  '/listThemes',
  verifyToken,
  themeController.list as unknown as express.RequestHandler,
);
// POST /api/themes/apply - Apply/Update selected theme
DashboardThemeRouter.post('/applyTheme', verifyToken, themeController.applyTheme);

// GET /api/themes/selected - Get currently selected theme
DashboardThemeRouter.get('/selectedTheme', verifyToken, themeController.getSelectedTheme);

// DELETE /api/themes/selected - Clear selected theme
DashboardThemeRouter.delete('/clearSelectedTheme', verifyToken, themeController.clearSelectedTheme);
export default DashboardThemeRouter;
