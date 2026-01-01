import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { VendorOfferPriceHistory } from '@/types/vendorComparison';

export function useOfferPriceHistory(offerId: string) {
  const [history, setHistory] = useState<VendorOfferPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!offerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, 'vendor_offer_price_history'),
          where('offer_id', '==', offerId),
          orderBy('changed_at', 'desc')
        );

        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as VendorOfferPriceHistory[];

        setHistory(historyData);
      } catch (err: any) {
        console.error('Error fetching price history:', err);
        setError(err.message || 'Failed to load price history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [offerId]);

  return { history, loading, error };
}

