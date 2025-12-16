import webpush from 'web-push';
// import { prisma } from './prisma';

// Initialize web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// TODO: Add PushSubscription model to Prisma schema before using this function
export async function sendPushNotificationToDevice(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  // Temporarily disabled until PushSubscription model is added to schema
  console.log('Push notification service not yet configured. Add PushSubscription model to Prisma schema.');
  return { success: false, error: 'Push subscription model not configured' };
  
  /* TODO: Uncomment when PushSubscription model is added
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, enabled: true },
    });

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return { success: false, error: 'No subscriptions' };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/habits',
        ...data,
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const subscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(subscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { enabled: false },
            });
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r: any) => r.status === 'fulfilled').length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);
    
    return {
      success: successful > 0,
      sent: successful,
      failed,
    };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  */
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}
