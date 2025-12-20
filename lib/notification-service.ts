import { prisma } from '@/lib/prisma';
import { sendPushNotification as sendWebPush } from '@/lib/web-push';

export async function sendNotification(userId: string, title: string, message: string, type: string, data?: any) {
  try {
    // 1. Create in-app notification
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    // 2. Send Web Push
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true },
    });

    if (user && user.pushSubscriptions.length > 0) {
      const payload = {
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        url: '/', // Default URL
        ...data
      };

      const promises = user.pushSubscriptions.map(sub => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return sendWebPush(subscription, payload);
      });

      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendPushNotificationToUser(userId: string, title: string, message: string, url: string = '/', data: any = {}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true },
    });

    if (user && user.pushSubscriptions.length > 0) {
      const payload = {
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        url,
        ...data
      };

      const promises = user.pushSubscriptions.map(sub => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return sendWebPush(subscription, payload);
      });

      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
