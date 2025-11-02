import { useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseAvailable } from '@/lib/firebase';
import { useFirebaseSubscription } from './useFirebaseSubscription';

export interface VendorPrice {
  price: number;
  url: string;
  lastUpdated: number;
  submittedBy: string;
}

export interface PeptideVendorPrices {
  [vendorId: string]: VendorPrice;
}

export interface VendorPricesData {
  [peptideId: string]: PeptideVendorPrices;
}

const DEFAULT_VENDOR_PRICES: VendorPricesData = {};

/**
 * Hook for real-time vendor prices from Firebase
 * Automatically subscribes and unsubscribes to prevent memory leaks
 */
export function useVendorPrices() {
  const subscribe = useCallback((callback: (data: VendorPricesData) => void) => {
    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.warn('Firebase not configured. Vendor prices will not be available.');
      callback(DEFAULT_VENDOR_PRICES);
      return () => {}; // Return empty cleanup function
    }

    const database = getFirebaseDatabase();
    if (!database) {
      callback(DEFAULT_VENDOR_PRICES);
      return () => {};
    }

    // Create reference to vendor prices
    const pricesRef = ref(database, 'vendorPrices');

    // Subscribe to value changes
    const unsubscribe = onValue(
      pricesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback(data as VendorPricesData);
        } else {
          callback(DEFAULT_VENDOR_PRICES);
        }
      },
      (error) => {
        console.error('Firebase vendor prices subscription error:', error);
        callback(DEFAULT_VENDOR_PRICES);
      }
    );

    // Return cleanup function
    return () => {
      off(pricesRef, 'value', unsubscribe);
    };
  }, []);

  return useFirebaseSubscription<VendorPricesData>(subscribe, DEFAULT_VENDOR_PRICES);
}

/**
 * Hook for a specific peptide's vendor prices
 */
export function usePeptideVendorPrices(peptideId: string) {
  const subscribe = useCallback((callback: (data: PeptideVendorPrices) => void) => {
    if (!isFirebaseAvailable()) {
      callback({});
      return () => {};
    }

    const database = getFirebaseDatabase();
    if (!database) {
      callback({});
      return () => {};
    }

    const peptidePricesRef = ref(database, `vendorPrices/${peptideId}`);

    const unsubscribe = onValue(
      peptidePricesRef,
      (snapshot) => {
        const data = snapshot.val();
        callback(data || {});
      },
      (error) => {
        console.error(`Firebase peptide ${peptideId} prices subscription error:`, error);
        callback({});
      }
    );

    return () => {
      off(peptidePricesRef, 'value', unsubscribe);
    };
  }, [peptideId]);

  return useFirebaseSubscription<PeptideVendorPrices>(subscribe, {});
}
