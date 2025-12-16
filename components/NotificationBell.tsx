'use client';

import { useState, useRef, useEffect } from 'react';
import { useKnockFeed } from '@knocklabs/react';
import { NotificationFeedPopover } from '@knocklabs/react-notification-feed';
import '@knocklabs/react-notification-feed/dist/index.css';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationBellProps {
  className?: string;
  badgeClassName?: string;
  icon?: string;
}

export default function NotificationBell({ className, badgeClassName, icon = '🔔' }: NotificationBellProps) {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);
  const { feedClient } = useKnockFeed();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!feedClient) return;
    
    // Set initial value
    const state = feedClient.store.getState();
    setUnreadCount(state.metadata.unread_count);

    // Subscribe to changes
    const unsubscribe = feedClient.store.subscribe((state) => {
      setUnreadCount(state.metadata.unread_count);
    });

    return () => unsubscribe();
  }, [feedClient]);

  const defaultClass = "relative px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover-scale";
  const defaultBadgeClass = "absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center";

  return (
    <>
      <button
        ref={notifButtonRef}
        onClick={() => setIsVisible(!isVisible)}
        className={className || defaultClass}
      >
        {icon} {t.inbox || 'Inbox'}
        {unreadCount > 0 && (
          <span className={badgeClassName || defaultBadgeClass}>
            {unreadCount}
          </span>
        )}
      </button>
      <NotificationFeedPopover
        buttonRef={notifButtonRef}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
}
