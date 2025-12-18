
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf79jJU6dJVV8ehfvluYQGFIoAN4PWh9A",
  authDomain: "clicker-app-8b08d.firebaseapp.com",
  projectId: "clicker-app-8b08d",
  storageBucket: "clicker-app-8b08d.firebasestorage.app",
  messagingSenderId: "1048463361714",
  appId: "1:1048463361714:web:7e1854c46bac058f73ebab",
  measurementId: "G-H94Y7DWQ5P"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics (conditionally loaded for SSR safety)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Export messaging for use in hooks
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;
    
    try {
        const currentToken = await getToken(messaging, { 
            vapidKey: 'BBr6CRPLwLzDtJRyqfr4hQA_X2XFuTbLp_jw4foNEBAEDVOy9yzqH3fxFGBhfYEj3Hv1TT-pr57DQAY-gc0aNDE' 
        });
        
        if (currentToken) {
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });

export { app };
