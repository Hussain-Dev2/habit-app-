'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch } from '@/lib/client';

interface NotificationBellProps {
  className?: string;
  badgeClassName?: string;
  icon?: string;
}

export default function NotificationBell({ className, badgeClassName, icon = '🔔' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await apiFetch<any[]>('/notifications');
        const count = notifications.filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const defaultClass = "relative px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover-scale";
  const defaultBadgeClass = "absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center";

  return (
    <Link
      href="/inbox"
      className={className || defaultClass}
    >
      {icon} {t.inbox || 'Inbox'}
      {unreadCount > 0 && (
        <span className={badgeClassName || defaultBadgeClass}>
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
