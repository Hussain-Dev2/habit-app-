'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useSession } from 'next-auth/react';

export default function NotificationPrompt() {
  const { status } = useSession();
  const { isSupported, subscribeToNotifications, subscription } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only check if user is logged in
    if (status !== 'authenticated') return;

    // Check strict browser support first
    if (!isSupported) return;

    // Check if we already showed it this session/recently
    const hasSeenPrompt = localStorage.getItem('notificationPromptSeen');
    if (hasSeenPrompt) return;

    // If already subscribed, don't show
    if (subscription) {
      // Just in case checking subscription takes time, verify permission directly too
      if (Notification.permission === 'granted') return;
    }

    // Double check raw permission, as subscription state might lag
    if (Notification.permission === 'granted') return;

    // If permission is denied, user has to manually enable it, so maybe don't bug them?
    // User requested "when user enter the app", suggesting a nudge for those who haven't decided
    if (Notification.permission === 'default') {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

  }, [status, isSupported, subscription]);

  const handleEnable = async () => {
    try {
      await subscribeToNotifications();
      setShowPrompt(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
       // If denied during prompt, close it
       if (Notification.permission === 'denied') {
           setShowPrompt(false);
       }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session (or permanently if you prefer)
    localStorage.setItem('notificationPromptSeen', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal - Bottom Sheet on mobile, Center on desktop */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-slide-up">
        {/* Visual Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <span className="text-3xl">🔔</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Don't Miss Out!</h3>
          <p className="text-blue-100 text-sm">
            Get timely reminders for your streaks and rewards.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-green-500 text-lg">✓</span>
              <span>Daily habit reminders</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-orange-500 text-lg">🔥</span>
              <span>Streak rescue alerts</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-purple-500 text-lg">🎁</span>
              <span>Reward updates</span>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={handleEnable}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Turn On Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
