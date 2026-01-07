/**
 * Hook to cancel a running scraper job
 */

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface CancelResult {
  success: boolean;
  jobId: string;
}

export function useCancelScraperJob() {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelJob = async (jobId: string): Promise<boolean> => {
    setCancelling(true);
    setError(null);

    try {
      const functions = getFunctions();
      const cancelScraperJobFn = httpsCallable<{ jobId: string }, CancelResult>(
        functions,
        'cancelScraperJob'
      );

      const result = await cancelScraperJobFn({ jobId });

      if (result.data.success) {
        console.log(`[useCancelScraperJob] Job ${jobId} cancelled successfully`);
        return true;
      } else {
        setError('Failed to cancel job');
        return false;
      }
    } catch (err: any) {
      console.error('[useCancelScraperJob] Error:', err);
      setError(err.message || 'Unknown error');
      return false;
    } finally {
      setCancelling(false);
    }
  };

  return { cancelJob, cancelling, error };
}

