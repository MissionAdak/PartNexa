import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notificationsService from '../services/notificationsService';
import toast from 'react-hot-toast';
import './NotificationPage.css';

function formatFullTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getNotificationMeta(notif) {
  const type = notif.data?.type || '';
  const title = (notif.title || '').toLowerCase();

  if (type.includes('ORDER') || title.includes('order')) {
    return { icon: '📦', badge: 'Order', badgeColor: 'blue' };
  }
  if (type.includes('DELIVERY') || title.includes('delivery') || title.includes('rider')) {
    return { icon: '🚚', badge: 'Logistics', badgeColor: 'amber' };
  }
  if (type.includes('SHOP') || type.includes('WORKSHOP') || type.includes('SERVICE') || title.includes('service') || title.includes('workshop')) {
    return { icon: '🔧', badge: 'Service', badgeColor: 'emerald' };
  }
  if (type.includes('PAYMENT') || title.includes('payment') || title.includes('commission')) {
    return { icon: '💳', badge: 'Payment', badgeColor: 'purple' };
  }
  if (type.includes('SUBSCRIPTION') || title.includes('subscription') || title.includes('membership')) {
    return { icon: '👑', badge: 'Care Pass', badgeColor: 'teal' };
  }
  if (type.includes('USED_PART') || title.includes('used part') || title.includes('valuation')) {
    return { icon: '♻️', badge: 'Eco-Part', badgeColor: 'green' };
  }
  if (type.includes('KYC') || title.includes('kyc')) {
    return { icon: '🛡️', badge: 'Compliance', badgeColor: 'rose' };
  }
  return { icon: '🔔', badge: 'Alert', badgeColor: 'slate' };
}

export const NotificationPage = ({ portal: initialPortal }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const portal = initialPortal || (
    location.pathname.startsWith('/shop')
      ? 'shop'
      : location.pathname.startsWith('/delivery')
      ? 'delivery'
      : location.pathname.startsWith('/admin')
      ? 'admin'
      : 'customer'
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await notificationsService.getNotifications({
        unreadOnly: filter === 'UNREAD',
        limit: 50,
      });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
      setTotalCount(res.pagination?.total || (res.notifications || []).length);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
      if (!isSilent) toast.error('Failed to load notifications.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
    // Moderate polling every 25 seconds while on notification page
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 25000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
      toast.success('Notification marked as read.');
    } catch (err) {
      toast.error('Could not update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Could not mark all as read.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
      toast.success('Notification deleted.');
    } catch (err) {
      toast.error('Could not delete notification.');
    }
  };

  const handleRowClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationsService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent('notifications:refresh'));
      } catch (err) {
        console.warn('Silent mark-as-read error:', err);
      }
    }

    const route = notif.data?.route;
    if (route && typeof route === 'string') {
      navigate(route);
    }
  };

  return (
    <div className="notification-page-wrapper">
      <div className="notification-page-container">
        {/* Header Breadcrumb / Meta */}
        <div className="notification-page-header">
          <div>
            <div className="header-meta-row">
              <span className="portal-indicator-badge">
                {portal === 'customer'
                  ? 'Customer Center'
                  : portal === 'shop'
                  ? 'Workshop Console'
                  : portal === 'delivery'
                  ? 'Logistics Fleet'
                  : 'Executive Admin'}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-text">Real-time Activity Stream</span>
            </div>
            <h1 className="notification-page-title">Notification Center</h1>
            <p className="notification-page-subtitle">
              Stay informed on order confirmations, shipments, workshop schedules, and account activities.
            </p>
          </div>

          <div className="notification-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                id="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                ✓ Mark all as read
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm refresh-icon-btn"
              onClick={() => loadNotifications(false)}
              disabled={isLoading || isRefreshing}
              title="Refresh notifications"
              aria-label="Refresh"
            >
              <span className={isRefreshing ? 'spinning' : ''}>🔄</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="notification-filter-bar">
          <div className="filter-tabs-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'ALL'}
              className={`filter-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
              id="filter-all-tab"
              onClick={() => setFilter('ALL')}
            >
              All Notifications
              <span className="tab-count-pill">{totalCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'UNREAD'}
              className={`filter-tab-btn ${filter === 'UNREAD' ? 'active' : ''}`}
              id="filter-unread-tab"
              onClick={() => setFilter('UNREAD')}
            >
              Unread
              {unreadCount > 0 && (
                <span className="tab-count-pill unread-pill">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="notification-content-area">
          {isLoading ? (
            <div className="notification-skeleton-loader">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-item animate-pulse">
                  <div className="skeleton-icon" />
                  <div className="skeleton-text-group">
                    <div className="skeleton-line title-line" />
                    <div className="skeleton-line body-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty-state">
              <div className="empty-state-illustration">
                {filter === 'UNREAD' ? '✨' : '🔔'}
              </div>
              <h2 className="empty-state-title">
                {filter === 'UNREAD' ? "You're all caught up!" : 'No notifications yet'}
              </h2>
              <p className="empty-state-description">
                {filter === 'UNREAD'
                  ? 'All notifications have been reviewed. You have no pending alerts.'
                  : 'Important updates regarding orders, DIFM bookings, and payments will appear here.'}
              </p>
              {filter === 'UNREAD' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setFilter('ALL')}
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            <div className="notification-card-list">
              {notifications.map((notif) => {
                const meta = getNotificationMeta(notif);
                const hasDeepLink = Boolean(notif.data?.route);

                return (
                  <div
                    key={notif.id}
                    className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleRowClick(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRowClick(notif);
                      }
                    }}
                  >
                    {/* Category Icon */}
                    <div className="notification-badge-col">
                      <div className="notif-circle-icon">{meta.icon}</div>
                    </div>

                    {/* Body Content */}
                    <div className="notification-main-col">
                      <div className="notif-top-line">
                        <div className="notif-tags-wrap">
                          <span className={`notif-category-chip chip-${meta.badgeColor}`}>
                            {meta.badge}
                          </span>
                          <span className="notif-time-badge" title={formatFullTime(notif.createdAt)}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>

                        <div className="notif-actions-inline" onClick={(e) => e.stopPropagation()}>
                          {!notif.isRead && (
                            <button
                              type="button"
                              className="inline-action-btn mark-read-icon"
                              title="Mark as read"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                            >
                              ✓ Read
                            </button>
                          )}
                          <button
                            type="button"
                            className="inline-action-btn delete-icon"
                            title="Delete notification"
                            onClick={(e) => handleDelete(notif.id, e)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <h3 className="notif-card-title">{notif.title}</h3>
                      <p className="notif-card-body">{notif.body}</p>

                      {hasDeepLink && (
                        <div className="notif-deeplink-row">
                          <span className="deeplink-action">
                            View details →
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && <div className="unread-pulse-marker" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
