import webPush from 'web-push';

// Configure VAPID keys
// You should generate these keys using `npx web-push generate-vapid-keys`
// and add them to your .env file
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

if (publicKey && privateKey) {
  webPush.setVapidDetails(
    'mailto:support@reckon.app', // Replace with your email
    publicKey,
    privateKey
  );
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys are missing. Push notifications will not be sent.');
    return;
  }

  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
