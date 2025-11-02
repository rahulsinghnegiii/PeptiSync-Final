import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase app and database
 * Only initializes if configuration is available
 */
export const initializeFirebase = () => {
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.warn('Firebase configuration is missing. Real-time features will be disabled.');
    return null;
  }

  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);

      // Initialize analytics only in browser environment
      if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
      }

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return null;
    }
  }

  return database;
};

/**
 * Get Firebase database instance
 * Initializes if not already initialized
 */
export const getFirebaseDatabase = () => {
  if (!database) {
    return initializeFirebase();
  }
  return database;
};

/**
 * Check if Firebase is configured and available
 */
export const isFirebaseAvailable = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.databaseURL;
};

/**
 * Get Firebase analytics instance
 */
export const getFirebaseAnalytics = () => {
  if (!analytics && app && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  return analytics;
};
