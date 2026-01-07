/**
 * useScraperJobDetails Hook
 * 
 * Fetches job details + vendor subcollection
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ScraperJob, ScraperJobVendor } from '@/types/scraperMonitoring';

export function useScraperJobDetails(jobId: string | null) {
  const [job, setJob] = useState<ScraperJob | null>(null);
  const [vendors, setVendors] = useState<ScraperJobVendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobDetails = async () => {
    if (!jobId) {
      setJob(null);
      setVendors([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load job document
      const jobRef = doc(db, 'scraper_jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      
      if (!jobSnap.exists()) {
        throw new Error('Job not found');
      }
      
      const jobData: ScraperJob = {
        id: jobSnap.id,
        ...jobSnap.data()
      } as ScraperJob;
      
      setJob(jobData);
      
      // Load vendors subcollection
      const vendorsRef = collection(db, 'scraper_jobs', jobId, 'vendors');
      const vendorsSnap = await getDocs(vendorsRef);
      
      const vendorsData: ScraperJobVendor[] = vendorsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScraperJobVendor));
      
      setVendors(vendorsData);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  return {
    job,
    vendors,
    loading,
    error,
    refresh: loadJobDetails,
  };
}

