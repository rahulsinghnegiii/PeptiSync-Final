// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Debug logging
console.log('[Firebase] Initializing...', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  env: import.meta.env.MODE,
});

// Validate environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMsg = `Missing Firebase environment variables:
    VITE_FIREBASE_API_KEY: ${firebaseConfig.apiKey ? 'Set' : 'MISSING'}
    VITE_FIREBASE_PROJECT_ID: ${firebaseConfig.projectId ? 'Set' : 'MISSING'}
    
    Please check your .env file or deployment platform environment variables.`;
  
  console.error('[Firebase]', errorMsg);
  
  // Show error on page
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      const root = document.getElementById('root');
      if (root && root.children.length === 0) {
        root.innerHTML = `
          <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%); color: #fff; min-height: 100vh;">
            <div style="max-width: 800px; margin: 0 auto;">
              <h1 style="color: #ff6b6b; font-size: 32px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 48px;">⚠️</span>
                Firebase Configuration Missing
              </h1>
              <div style="background: rgba(255, 107, 107, 0.1); border: 2px solid #ff6b6b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">${errorMsg}</pre>
              </div>
              <div style="background: rgba(139, 92, 246, 0.1); border: 2px solid #8b5cf6; border-radius: 12px; padding: 24px;">
                <h2 style="color: #8b5cf6; margin-top: 0; margin-bottom: 16px;">How to Fix:</h2>
                <ol style="line-height: 1.8; padding-left: 24px;">
                  <li>Create a <strong>.env</strong> file in the project root</li>
                  <li>Add these variables:
                    <ul style="margin-top: 8px; margin-bottom: 8px;">
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_API_KEY</code></li>
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_PROJECT_ID</code></li>
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_AUTH_DOMAIN</code></li>
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_STORAGE_BUCKET</code></li>
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_MESSAGING_SENDER_ID</code></li>
                      <li><code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">VITE_FIREBASE_APP_ID</code></li>
                    </ul>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        `;
      }
    }, 1000);
  }
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app); // Realtime Database
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId
  ? getAnalytics(app)
  : null;

// Helper functions for backward compatibility
export const getFirebaseDatabase = () => database;
export const isFirebaseAvailable = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};

// Connect to emulators in development if needed
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectDatabaseEmulator(database, 'localhost', 9000);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('[Firebase] Connected to emulators');
}

console.log('[Firebase] Initialized successfully');
