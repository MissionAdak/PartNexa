import prisma from '../../config/prisma';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import AppError from '../../utils/AppError';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  channel?: NotificationChannel | 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  status?: NotificationStatus | 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  data?: {
    route?: string;
    type?: string;
    orderId?: string;
    shopId?: string;
    deliveryId?: string;
    subscriptionId?: string;
    usedPartId?: string;
    [key: string]: any;
  } | null;
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Creates an authoritative platform notification.
 * Safe invocation: logs warning without throwing if notification creation fails.
 */
export const createNotification = async (input: CreateNotificationInput) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        channel: (input.channel as any) || NotificationChannel.IN_APP,
        status: (input.status as any) || NotificationStatus.DELIVERED,
        data: input.data || null,
        isRead: false,
      },
    });
    return notification;
  } catch (err) {
    console.warn('[NotificationService] Failed to create notification:', err);
    return null;
  }
};

/**
 * Retrieves paginated notifications for the authenticated user only.
 */
export const getUserNotifications = async (userId: string, options: GetNotificationsOptions = {}) => {
  const limit = Math.min(Math.max(1, Number(options.limit) || 20), 100);
  const offset = Math.max(0, Number(options.offset) || 0);
  const unreadOnly = Boolean(options.unreadOnly);

  const whereClause: any = { userId };
  if (unreadOnly) {
    whereClause.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: whereClause }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + notifications.length < total,
    },
    unreadCount,
  };
};

/**
 * Gets the count of unread notifications for the user.
 */
export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
  return { unreadCount: count };
};

/**
 * Marks a single notification as read.
 * Strict authorization: user can only update their own notification.
 */
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!existing) {
    throw AppError.notFound('Notification not found or access denied.');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
      status: NotificationStatus.READ,
    },
  });

  return updated;
};

/**
 * Marks all notifications for the user as read.
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
      status: NotificationStatus.READ,
    },
  });

  return { markedCount: result.count };
};

/**
 * Deletes a notification belonging to the authenticated user.
 */
export const deleteNotification = async (userId: string, notificationId: string) => {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!existing) {
    throw AppError.notFound('Notification not found or access denied.');
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { success: true };
};
