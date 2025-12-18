
import { useEffect, useState } from 'react';
import { requestForToken } from '@/lib/firebase';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/client';

export function useFcmToken() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          // Register service worker if not already registered (though Next.js usually handles this if PWA)
          // But Firebase needs its specific one
          /* Note: We rely on the firebase-messaging-sw.js being present in public folder */
          
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);

          if (permission === 'granted') {
            const currentToken = await requestForToken();
            if (currentToken) {
              setToken(currentToken);
              // Send token to server
              if (session?.user?.email) {
                  await saveTokenToServer(currentToken);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving FCM token:', error);
      }
    };

    retrieveToken();
  }, [session]);

  const saveTokenToServer = async (token: string) => {
    try {
        await apiFetch('/notifications/save-token', {
            method: 'POST',
            body: JSON.stringify({ token, deviceType: 'web' })
        });
        console.log('FCM Token saved to server');
    } catch (error: any) {
        console.error('Failed to save FCM token:', error);
        // alert(`Token Save Error: ${error.message}`); // Valid debugging
    }
  };

  return { token, notificationPermission };
}
