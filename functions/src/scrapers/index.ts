/**
 * Scraper Cloud Functions
 * 
 * Exports:
 * - dailyScraperJob: Scheduled function (runs daily at 3 AM UTC)
 * - triggerScrapers: Manual trigger (admin-only)
 * - testVendorScraper: Test single vendor (admin-only)
 * - saveVendorUrls: Save vendor URL configuration (admin-only)
 * - getVendorUrls: Get vendor URL configuration (admin-only)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { runAllScrapers } from './runner';
import { getVendorScraper } from './vendors';

// Export vendor URL management functions
export * from './vendor-urls';

/**
 * Daily scheduled scraper job
 * Runs at 3 AM UTC every day
 */
export const dailyScraperJob = functions
  .runWith({ 
    timeoutSeconds: 540,  // 9 minutes (same as manual trigger)
    memory: '1GB'         // More memory for processing multiple vendors
  })
  .pubsub
  .schedule('0 3 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('[Scheduled] Starting daily scraper job...');
    try {
      const jobId = await runAllScrapers('scheduled');
      console.log(`[Scheduled] Job ${jobId} completed`);
      return { success: true, jobId };
    } catch (error: any) {
      console.error('[Scheduled] Job failed:', error);
      throw error;
    }
  });

/**
 * Manual trigger for all scrapers
 * Admin-only callable function
 * Returns immediately with jobId, job runs in background
 */
export const triggerScrapers = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' }) // 9 minutes max
  .https.onCall(async (data, context) => {
    // Check admin auth
    if (!context.auth?.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }

    console.log(`[Manual] Triggering all scrapers (user: ${context.auth.uid})`);

    try {
      // Start job asynchronously (don't await)
      const jobPromise = runAllScrapers('manual', context.auth.uid);
      
      // Wait just long enough to get the jobId
      const jobId = await jobPromise;
      
      console.log(`[Manual] Job ${jobId} started successfully`);
      return { success: true, jobId };
    } catch (error: any) {
      console.error('[Manual] Job failed to start:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Test single vendor scraper
 * Admin-only callable function
 */
export const testVendorScraper = functions.https.onCall(async (data, context) => {
  // Check admin auth
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { vendorId, vendorName } = data;

  if (!vendorId || !vendorName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'vendorId and vendorName required'
    );
  }

  console.log(`[Test] Running scraper for ${vendorName}...`);

  try {
    const db = admin.firestore();
    const scraper = await getVendorScraper(db, vendorId);

    if (!scraper) {
      throw new functions.https.HttpsError(
        'not-found',
        `No scraper configured for ${vendorName}`
      );
    }

    const results = await scraper.scrape();

    const validResults = results.filter(r => r.valid);
    const invalidResults = results.filter(r => !r.valid);

    return {
      success: true,
      vendor: vendorName,
      products_found: results.length,
      products_valid: validResults.length,
      products_failed: invalidResults.length,
      sample_results: validResults.slice(0, 5).map(r => ({
        peptide_name: r.peptide_name,
        size_mg: r.size_mg,
        price_usd: r.price_usd,
        product_url: r.product_url,
      })),
      validation_errors: invalidResults.slice(0, 5).map(r => ({
        peptide_name: r.peptide_name,
        error: r.validation_error,
        product_url: r.product_url,
      })),
    };
  } catch (error: any) {
    console.error(`[Test] Failed for ${vendorName}:`, error);
    return {
      success: false,
      vendor: vendorName,
      error: error.message,
    };
  }
});

/**
 * Cancel a running scraper job
 * Admin-only callable function
 */
export const cancelScraperJob = functions.https.onCall(async (data, context) => {
  // Check admin auth
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { jobId } = data;

  if (!jobId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'jobId required'
    );
  }

  console.log(`[Cancel] Cancelling job ${jobId} (user: ${context.auth.uid})`);

  try {
    const db = admin.firestore();
    const jobRef = db.collection('scraper_jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Job not found');
    }

    const job = jobDoc.data();

    if (job?.status !== 'running') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Job is not running (status: ${job?.status})`
      );
    }

    // Update job to cancelled status
    await jobRef.update({
      status: 'cancelled',
      cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
      cancelled_by: context.auth.uid,
      completed_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Cancel] Job ${jobId} marked as cancelled`);
    return { success: true, jobId };
  } catch (error: any) {
    console.error(`[Cancel] Failed to cancel job ${jobId}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});

