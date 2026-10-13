import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notificationsService from '../../services/notificationsService';
import { Package, Truck, Wrench, CreditCard, Crown, RotateCcw, ShieldCheck, Bell } from 'lucide-react';
import './NotificationBell.css';

/**
 * Format timestamp into human-readable relative time string
 */
function formatTimeAgo(dateString) {
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

/**
 * Get category icon according to notification type / title
 */
function getNotificationIcon(notif) {
  const type = notif.data?.type || '';
  const title = (notif.title || '').toLowerCase();

  if (type.includes('ORDER') || title.includes('order')) return <Package size={16} strokeWidth={1.75} />;
  if (type.includes('DELIVERY') || title.includes('delivery') || title.includes('rider')) return <Truck size={16} strokeWidth={1.75} />;
  if (type.includes('SHOP') || type.includes('WORKSHOP') || type.includes('SERVICE') || title.includes('service') || title.includes('workshop')) return <Wrench size={16} strokeWidth={1.75} />;
  if (type.includes('PAYMENT') || title.includes('payment') || title.includes('commission')) return <CreditCard size={16} strokeWidth={1.75} />;
  if (type.includes('SUBSCRIPTION') || title.includes('subscription') || title.includes('membership')) return <Crown size={16} strokeWidth={1.75} />;
  if (type.includes('USED_PART') || title.includes('used part') || title.includes('valuation')) return <RotateCcw size={16} strokeWidth={1.75} />;
  if (type.includes('KYC') || title.includes('kyc')) return <ShieldCheck size={16} strokeWidth={1.75} />;
  return <Bell size={16} strokeWidth={1.75} />;
}

export const NotificationBell = ({ role = 'customer' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current portal's notifications route
  const getNotificationsRoute = () => {
    if (location.pathname.startsWith('/shop')) return '/shop/notifications';
    if (location.pathname.startsWith('/delivery')) return '/delivery/notifications';
    if (location.pathname.startsWith('/admin')) return '/admin/notifications';
    if (role === 'shop') return '/shop/notifications';
    if (role === 'delivery') return '/delivery/notifications';
    if (role === 'admin') return '/admin/notifications';
    return '/customer/notifications';
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently ignore if unauthenticated
    }
  };

  const fetchPreviewNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.getNotifications({ limit: 5 });
      setPreviewList(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to fetch preview notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Moderate Polling: 20 seconds (between required 15-30s window)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);

    const handleRefresh = () => {
      fetchUnreadCount();
      if (isOpen) fetchPreviewNotifications();
    };

    window.addEventListener('notifications:refresh', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', handleRefresh);
    };
  }, [isOpen]);

  // Handle dropdown open / close
  const toggleDropdown = () => {
    if (!isOpen) {
      setIsOpen(true);
      fetchPreviewNotifications();
    } else {
      setIsOpen(false);
    }
  };

  // Click outside and escape key handling
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = async (notif) => {
    setIsOpen(false);
    try {
      if (!notif.isRead) {
        await notificationsService.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to mark read on click:', err);
    }

    const route = notif.data?.route;
    if (route && typeof route === 'string') {
      navigate(route);
    } else {
      navigate(getNotificationsRoute());
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      setPreviewList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(getNotificationsRoute());
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-bell-btn ${isOpen ? 'active' : ''}`}
        id="notification-bell-btn"
        onClick={toggleDropdown}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        title="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge" id="notification-unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown animate-fade-in-down" role="region" aria-label="Notifications preview">
          {/* Header */}
          <div className="notification-dropdown-header">
            <div className="header-left">
              <span className="dropdown-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="unread-chip">{unreadCount} New</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notification-preview-list">
            {isLoading ? (
              <div className="notification-loading-state">
                <div className="spinner-sm" />
                <span>Loading notifications...</span>
              </div>
            ) : previewList.length === 0 ? (
              <div className="notification-empty-preview">
                <Bell size={32} strokeWidth={1.75} className="empty-icon" style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p className="empty-text">No notifications yet</p>
                <span className="empty-sub">We'll alert you about orders, deliveries & updates.</span>
              </div>
            ) : (
              previewList.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className="notif-icon-col">
                    <span className="notif-type-icon">{getNotificationIcon(notif)}</span>
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-item-header">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="notif-body-preview">{notif.body}</p>
                  </div>
                  {!notif.isRead && <span className="unread-indicator-dot" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notification-dropdown-footer">
            <button
              type="button"
              className="view-all-notifs-btn"
              id="notification-view-all-btn"
              onClick={handleViewAll}
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
