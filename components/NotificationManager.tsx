
'use client';

import { useEffect } from 'react';
import { useFcmToken } from '@/hooks/useFcmToken';
import { onMessageListener } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import Toast from './Toast';
import { useState } from 'react';

export default function NotificationManager() {
  const { token, notificationPermission } = useFcmToken();
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        console.log('Foreground notification received:', payload);
        
        // Show in-app toast for foreground notifications
        setToast({
            message: `${payload.notification.title}: ${payload.notification.body}`,
            type: 'info'
        });

        // Optional: Play a sound
        try {
            const audio = new Audio('/sounds/notification.mp3'); 
            audio.play().catch(e => console.log('Audio play failed', e));
        } catch (e) {
            // ignore
        }
      }
    });

    return () => {
      // unsubscribe if possible (Promise doesn't return unsubscribe directly in current impl, 
      // but standard firebase logic usually does. Our wrapper mimics a promise. 
      // If needed we can adjust lib/firebase.ts to return unsubscribe)
    };
  }, []);

  return (
    <>
      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}
      
      {/* Explicit permission request for debugging/first-time flow if needed */}
      {notificationPermission === 'default' && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
            <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:bg-blue-700 transition"
                onClick={() => window.location.reload()} // Quickest way to re-trigger the hook's effect for now
            >
                🔔 Enable Notifications
            </button>
        </div>
      )}
    </>
  );
}
