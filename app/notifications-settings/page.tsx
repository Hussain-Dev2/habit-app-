'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Toast from '@/components/Toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationInbox() {
  const { data: session } = useSession();
  const { isSupported, subscription, subscribeToNotifications } = usePushNotifications();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch notifications
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    try {
      setToast({ message: 'Requesting permission...', type: 'info' });
      await subscribeToNotifications();
      setToast({ message: 'Notifications enabled!', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message || 'Failed to enable', type: 'error' });
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours, show relative time or time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Otherwise show date
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'streak_rescue': return '🔥';
      case 'admin_gift': return '🎁';
      case 'habit_reminder': return '⏰';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-md mx-auto pt-6 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span>Your Notifications</span>
        </h1>

        {/* Permission State */}
        {!subscription && (
          <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-xl text-white transform transition-all hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <span className="text-3xl">🔕</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Don't Miss Out!</h2>
            <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
              Enable notifications to get streak rescues, reward alerts, and important updates.
            </p>
            <button
              onClick={handleEnable}
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>Enable Notifications</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {!isSupported && (
              <p className="mt-3 text-xs text-red-200 text-center bg-red-500/20 py-1 rounded">
                Your browser might not support push notifications.
              </p>
            )}
          </div>
        )}

        {/* Notification List */}
        <div className="space-y-4">
          {loading ? (
             // Skeletons
             [1, 2, 3].map(i => (
               <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-xl animate-pulse" />
             ))
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 transition-all hover:shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                      {n.title}
                    </h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">
                 📭
               </div>
               <h3 className="text-slate-900 dark:text-white font-medium mb-1">All caught up!</h3>
               <p className="text-slate-500 text-sm">No notifications to show yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
