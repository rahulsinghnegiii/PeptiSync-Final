import { useEffect, useRef, useState } from 'react';

/**
 * Hook for Firebase Realtime Database subscriptions with automatic cleanup
 * Prevents memory leaks by unsubscribing on component unmount
 */
export function useFirebaseSubscription<T>(
  subscribe: (callback: (data: T) => void) => () => void,
  initialValue: T
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Subscribe to Firebase
      unsubscribeRef.current = subscribe((newData) => {
        setData(newData);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Subscription failed'));
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (err) {
          console.error('Firebase unsubscribe error:', err);
        }
        unsubscribeRef.current = null;
      }
    };
  }, [subscribe]);

  return { data, loading, error };
}

/**
 * Hook for managing multiple Firebase subscriptions
 */
export function useFirebaseSubscriptions() {
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const addSubscription = (unsubscribe: () => void) => {
    subscriptionsRef.current.push(unsubscribe);
  };

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions on unmount
      subscriptionsRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Firebase cleanup error:', error);
        }
      });
      subscriptionsRef.current = [];
    };
  }, []);

  return { addSubscription };
}
