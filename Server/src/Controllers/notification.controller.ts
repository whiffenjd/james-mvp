// Controllers/notification.controller.ts
import { Request, Response } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../Utils/response';
import { NotificationQuerySchema } from '../validators/notification.schema';
import * as NotificationService from '../Services/notification.service';
import { z } from 'zod';

// Controllers/notification.controller.ts
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId, role } = req.user!;
    const { userId } = req.params;

    if (userId !== currentUserId) {
      return sendErrorResponse(res, 'You can only fetch your own notifications', 403);
    }

    const parsedQuery = NotificationQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return sendErrorResponse(res, parsedQuery.error.message, 400);
    }

    const notifications = await NotificationService.getNotifications(userId, parsedQuery.data);
    return sendSuccessResponse(res, 'Notifications retrieved successfully', 200, notifications);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to fetch notifications',
      500,
    );
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const { userId } = req.params;

    // Validate path parameter
    if (userId !== currentUserId) {
      return sendErrorResponse(res, 'You can only fetch your own unread count', 403);
    }

    const unreadCount = await NotificationService.getUnreadCount(userId);
    return sendSuccessResponse(res, 'Unread notification count retrieved successfully', 200, {
      unreadCount,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to fetch unread count',
      500,
    );
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const { userId, notificationId } = req.params;

    // Validate path parameters
    if (userId !== currentUserId) {
      return sendErrorResponse(res, 'You can only mark your own notifications as read', 403);
    }

    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(notificationId).success) {
      return sendErrorResponse(res, 'Invalid notification ID', 400);
    }

    await NotificationService.markAsRead(userId, notificationId);
    return sendSuccessResponse(res, 'Notification marked as read', 200, null);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to mark notification as read',
      500,
    );
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const { userId } = req.params;

    // Validate path parameters
    if (userId !== currentUserId) {
      return sendErrorResponse(res, 'You can only mark your own notifications as read', 403);
    }

    await NotificationService.markAllAsRead(userId);
    return sendSuccessResponse(res, 'All notifications marked as read', 200, null);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to mark notifications as read',
      500,
    );
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const { userId, notificationId } = req.params;

    // Validate path parameters
    if (userId !== currentUserId) {
      return sendErrorResponse(res, 'You can only delete your own notifications', 403);
    }

    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(notificationId).success) {
      return sendErrorResponse(res, 'Invalid notification ID', 400);
    }

    await NotificationService.deleteNotification(userId, notificationId);
    return sendSuccessResponse(res, 'Notification deleted successfully', 200, null);
  } catch (error) {
    return sendErrorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete notification',
      500,
    );
  }
};
