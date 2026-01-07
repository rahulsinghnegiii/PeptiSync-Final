/**
 * useTriggerScrapers Hook
 * 
 * Calls triggerScrapers Cloud Function to run all scrapers manually
 */

import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { TriggerScrapersResult } from '@/types/scraperMonitoring';

export function useTriggerScrapers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriggerScrapersResult | null>(null);

  const triggerScrapers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const triggerFn = httpsCallable(functions, 'triggerScrapers');
      const response = await triggerFn({});
      
      const data = response.data as TriggerScrapersResult;
      setResult(data);
      
      return data;
    } catch (err: any) {
      console.error('Failed to trigger scrapers:', err);
      const errorMsg = err.message || 'Failed to trigger scrapers';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    triggerScrapers,
    loading,
    error,
    result,
  };
}

