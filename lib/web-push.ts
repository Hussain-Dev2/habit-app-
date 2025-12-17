import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BM_k_s_fake_public_key_for_build';
const privateKey = process.env.VAPID_PRIVATE_KEY || 'fake_private_key_for_build';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org',
    publicKey,
    privateKey
  );
}

export const sendPushNotification = async (subscription: any, payload: any) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
