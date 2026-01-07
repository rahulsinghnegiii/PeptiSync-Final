/**
 * useScraperJobs Hook
 * 
 * Fetches scraper job list from Firestore
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ScraperJob } from '@/types/scraperMonitoring';

export function useScraperJobs(limitCount: number = 50) {
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const jobsRef = collection(db, 'scraper_jobs');
      const q = query(
        jobsRef,
        orderBy('started_at', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      const jobsData: ScraperJob[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScraperJob));
      
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Failed to load scraper jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [limitCount]);

  return {
    jobs,
    loading,
    error,
    refresh: loadJobs,
  };
}

