'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isSupported, subscription, subscribeToNotifications } = usePushNotifications();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch<Notification[]>('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', {
        method: 'POST',
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_delivered':
        return '🎁';
      case 'order_pending':
        return '⏳';
      case 'system':
        return '📢';
      default:
        return '📬';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
        <div className="container mx-auto p-8">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                🔔 Inbox
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                {isAuthenticated
                  ? unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up!'
                  : 'Stay updated with your orders and rewards'}
              </p>
            </div>
            {isAuthenticated && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm sm:text-base rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
            {isAuthenticated && isSupported && !subscription && (
              <button
                onClick={subscribeToNotifications}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base rounded-lg transition-colors"
              >
                🔔 Enable Push Notifications
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {!isAuthenticated ? (
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 sm:p-10 lg:p-12 border-2 border-cyan-400 text-center">
                <div className="text-5xl sm:text-6xl mb-4">🔒</div>
                <p className="text-white text-xl sm:text-2xl font-bold mb-3">Sign in to view your notifications</p>
                <p className="text-slate-300 text-sm sm:text-base mb-6">Get updates on orders, rewards, and special offers!</p>
                <a
                  href="/login"
                  className="inline-block px-8 py-3 bg-gradient-ocean text-white font-semibold rounded-xl hover:shadow-glow transition-all duration-300"
                >
                  Sign In / Register
                </a>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 border border-slate-700 text-center">
                <div className="text-5xl sm:text-6xl mb-4">📭</div>
                <p className="text-slate-400 text-base sm:text-lg">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 sm:p-5 lg:p-6 border transition-all cursor-pointer ${
                    notification.isRead
                      ? 'border-slate-700'
                      : 'border-blue-500 bg-blue-900/20'
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 px-2 py-1 bg-blue-600 rounded-full text-xs text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm sm:text-base whitespace-pre-line mb-3">
                        {notification.message}
                      </p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-xs sm:text-sm text-slate-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {notification.orderId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/purchases');
                            }}
                            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300"
                          >
                            View Order →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
