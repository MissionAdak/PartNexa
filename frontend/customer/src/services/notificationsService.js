import api from './api';

export const notificationsService = {
  /**
   * Fetch paginated notifications for current user.
   */
  async getNotifications(params = {}) {
    const { unreadOnly = false, limit = 20, offset = 0 } = params;
    const response = await api.get('/notifications', {
      params: { unreadOnly, limit, offset },
    });
    return {
      notifications: response.data.data || [],
      pagination: response.data.pagination || { total: 0, limit, offset, hasMore: false },
      unreadCount: response.data.unreadCount || 0,
    };
  },

  /**
   * Fetch current unread notification count.
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.data?.unreadCount || 0;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications for current user as read.
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  /**
   * Delete a notification.
   */
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  },
};

export default notificationsService;
