// Routes/NotificationRouter.ts
import { Router } from 'express';
import * as NotificationController from '../Controllers/notification.controller';
import { verifyToken } from '../Middlewares/VerifyToken';
import express from 'express';

const router = Router();

router.get(
  '/:userId',
  verifyToken,
  NotificationController.getNotifications as unknown as express.RequestHandler,
);

router.get(
  '/:userId/unread-count',
  verifyToken,
  NotificationController.getUnreadCount as unknown as express.RequestHandler,
);

router.patch(
  '/:userId/:notificationId/read',
  verifyToken,
  NotificationController.markAsRead as unknown as express.RequestHandler,
);

router.delete(
  '/:userId/:notificationId',
  verifyToken,
  NotificationController.deleteNotification as unknown as express.RequestHandler,
);

//new route to mark all as read
router.patch(
  '/:userId/mark-all-read',
  verifyToken,
  NotificationController.markAllAsRead as unknown as express.RequestHandler,
);
export default router;
