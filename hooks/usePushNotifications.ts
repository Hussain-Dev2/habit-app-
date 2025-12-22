import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function usePushNotifications() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setRegistrationError('Push notifications are not supported in this browser.');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      // Check if already subscribed
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
      }
    } catch (error: any) {
      console.error('Service Worker registration failed:', error);
      setRegistrationError(error.message || 'Service Worker registration failed');
    }
  };

  const subscribeToNotifications = async () => {
    if (registrationError) {
      throw new Error(`Registration failed: ${registrationError}. Are you in Incognito mode?`);
    }
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    // Security Check
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      throw new Error('Notifications require HTTPS (secure connection). If testing on mobile via local IP, this feature will be blocked by the browser.');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let sub = await registration.pushManager.getSubscription();
      
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });
      }

      setSubscription(sub);

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      return sub;
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      // Propagate clearer errors
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        throw new Error('Permission denied. Please enable notifications in your browser settings.');
      }
      throw error;
    }
  };

  return { isSupported, subscription, subscribeToNotifications };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
