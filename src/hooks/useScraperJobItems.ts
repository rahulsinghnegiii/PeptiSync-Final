/**
 * useScraperJobItems Hook
 * 
 * Fetches items for a specific vendor within a job
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { ScraperJobItem } from '@/types/scraperMonitoring';

export function useScraperJobItems(
  jobId: string | null,
  vendorId: string | null,
  limitCount: number = 100
) {
  const [items, setItems] = useState<ScraperJobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!jobId || !vendorId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const itemsRef = collection(db, 'scraper_jobs', jobId, 'items');
      const q = query(
        itemsRef,
        where('vendor_id', '==', vendorId),
        firestoreLimit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      const itemsData: ScraperJobItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScraperJobItem));
      
      setItems(itemsData);
    } catch (err: any) {
      console.error('Failed to load job items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [jobId, vendorId, limitCount]);

  return {
    items,
    loading,
    error,
    refresh: loadItems,
  };
}

