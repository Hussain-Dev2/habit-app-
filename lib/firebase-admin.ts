import * as admin from 'firebase-admin';

const getFirebaseConfig = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
};

if (!admin.apps.length) {
  const config = getFirebaseConfig();
  if (config) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(config as admin.ServiceAccount),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  } else {
    console.warn('Firebase Admin credentials missing. Push notifications are disabled.');
  }
}

export const getMessaging = () => {
  if (!admin.apps.length) {
    return null;
  }
  return admin.messaging();
};
