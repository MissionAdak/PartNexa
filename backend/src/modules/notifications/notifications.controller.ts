import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as notificationsService from './notifications.service';

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true' || req.query.unread === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await notificationsService.getUserNotifications(req.user!.id, {
      unreadOnly,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user!.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const updated = await notificationsService.markNotificationAsRead(req.user!.id, id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationsService.markAllNotificationsAsRead(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const result = await notificationsService.deleteNotification(req.user!.id, id);
    res.status(200).json({
      success: true,
      message: 'Notification deleted.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
