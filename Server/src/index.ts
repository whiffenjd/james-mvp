import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './Routes/AuthUserRoutes';
import { xssSanitizer } from './Services/XssSanitizer';
import OtpRouter from './Routes/OtpVerificationRoutes';
import UserRouter from './Routes/UserProfileRoutes';
import investorAuthRouter from './Routes/InvestorAuthRoutes';
import { setupSwagger } from './configs/Swagger';
import investorOnboardingRouter from './Routes/investorOnboardingRouter';
import DashboardAssetRouter from './Routes/DashboardAssetsRoutes';
import managerOnboardingRouter from './Routes/managerOnboardingRouter';
import DashboardThemeRouter from './Routes/DashboardThemeRoutes';
import documentUploadRouter from './Routes/documentUploadRouter';
import FundRouter from './Routes/FundsManagerRoutes';
import CapitalCallRouter from './Routes/capitalCall.router';
import distributionsRoutes from './Routes/distributions.routes';
import fundReportRouter from './Routes/fundReport.router';
import NotificationRouter from './Routes/NotificationRouter';
import AdminRouter from './Routes/admin.routes';
import taxReportRouter from './Routes/taxReport.route';
import kycDocumentReporter from './Routes/kycDocuments.route';

dotenv.config();
export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware order is important
app.use(cors());

// Parse JSON and URL-encoded bodies before applying security middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupSwagger(app);

// Apply security middlewares after body parsing
app.use(helmet()); // Sets secure HTTP headers

// Alternative to xss-clean
// Apply our custom XSS sanitizer middleware
app.use(xssSanitizer);

// Routes
app.use('/auth/investor', investorAuthRouter);
app.use('/auth/user', authRouter);
app.use('/auth/otp', OtpRouter);
app.use('/profile/user', UserRouter);
app.use('/onboarding/investor', investorOnboardingRouter);
app.use('/list', managerOnboardingRouter);
app.use('/fund', FundRouter);
app.use('/dashboard/assets', DashboardAssetRouter);
app.use('/dashboard/theme', DashboardThemeRouter);
app.use('/api/documents', documentUploadRouter);
app.use('/capital-call', CapitalCallRouter);
app.use('/distribution', distributionsRoutes);
app.use('/fund-report', fundReportRouter);
app.use('/notifications', NotificationRouter);
app.use('/tax-report', taxReportRouter);
app.use('/kyc-documents', kycDocumentReporter);

app.use('/admin', AdminRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Error handling middleware - should be last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
