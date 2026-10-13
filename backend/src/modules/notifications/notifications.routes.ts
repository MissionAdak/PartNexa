import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as notificationsController from './notifications.controller';

const router = Router();

// All notification routes are strictly authenticated
router.use(authenticate);

// GET /api/notifications
router.get('/', notificationsController.getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', notificationsController.getUnreadCount);

// PATCH /api/notifications/read-all
router.patch('/read-all', notificationsController.markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationsController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationsController.deleteNotification);

export default router;
