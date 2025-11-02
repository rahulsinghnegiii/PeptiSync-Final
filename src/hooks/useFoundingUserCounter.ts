import { useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseAvailable } from '@/lib/firebase';
import { useFirebaseSubscription } from './useFirebaseSubscription';

interface FoundingUserCounter {
  current: number;
  total: number;
  lastUpdated?: number;
}

const DEFAULT_COUNTER: FoundingUserCounter = {
  current: 0,
  total: 500,
};

/**
 * Hook for real-time founding user counter from Firebase
 * Automatically subscribes and unsubscribes to prevent memory leaks
 */
export function useFoundingUserCounter() {
  const subscribe = useCallback((callback: (data: FoundingUserCounter) => void) => {
    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.warn('Firebase not configured. Using default counter values.');
      callback(DEFAULT_COUNTER);
      return () => {}; // Return empty cleanup function
    }

    const database = getFirebaseDatabase();
    if (!database) {
      callback(DEFAULT_COUNTER);
      return () => {};
    }

    // Create reference to founding user counter
    const counterRef = ref(database, 'foundingUserCounter');

    // Subscribe to value changes
    const unsubscribe = onValue(
      counterRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback({
            current: data.current || 0,
            total: data.total || 500,
            lastUpdated: data.lastUpdated,
          });
        } else {
          callback(DEFAULT_COUNTER);
        }
      },
      (error) => {
        console.error('Firebase counter subscription error:', error);
        callback(DEFAULT_COUNTER);
      }
    );

    // Return cleanup function
    return () => {
      off(counterRef, 'value', unsubscribe);
    };
  }, []);

  return useFirebaseSubscription<FoundingUserCounter>(subscribe, DEFAULT_COUNTER);
}
