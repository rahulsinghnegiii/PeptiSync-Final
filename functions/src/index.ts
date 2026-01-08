/**
 * PeptiSync Cloud Functions
 * 
 * Main entry point for all Firebase Cloud Functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export scraper functions
export * from './scrapers';

// Export admin management functions
export * from './admin';

// ============================================================================
// EXISTING TIMESTAMP UPDATE FUNCTIONS
// ============================================================================

const db = admin.firestore();

interface AutomationJobLog {
  job_type: 'daily_timestamp_update';
  status: 'running' | 'completed' | 'failed';
  started_at: admin.firestore.Timestamp;
  completed_at?: admin.firestore.Timestamp;
  offers_processed: number;
  errors?: string[];
  execution_time_ms?: number;
}

/**
 * Scheduled function that runs daily at 2:00 AM UTC
 * Updates last_price_check timestamp on all active verified offers
 */
export const dailyTimestampUpdate = functions.pubsub
  .schedule('0 2 * * *') // Runs at 2:00 AM UTC daily
  .timeZone('UTC')
  .onRun(async (context: functions.EventContext) => {
    const startTime = Date.now();
    const jobId = `job_${startTime}`;
    
    console.log('Starting daily timestamp update job...');

    // Create job log entry
    const jobLog: AutomationJobLog = {
      job_type: 'daily_timestamp_update',
      status: 'running',
      started_at: admin.firestore.Timestamp.now(),
      offers_processed: 0,
      errors: [],
    };

    try {
      // Log job start
      await db.collection('vendor_automation_jobs').doc(jobId).set(jobLog);

      // Fetch all active verified offers
      const offersSnapshot = await db
        .collection('vendor_offers')
        .where('status', '==', 'active')
        .where('verification_status', '==', 'verified')
        .get();

      console.log(`Found ${offersSnapshot.size} offers to update`);

      // Update last_price_check in batches (Firestore limit: 500 per batch)
      const batchSize = 500;
      let processedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < offersSnapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = offersSnapshot.docs.slice(i, i + batchSize);

        batchDocs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
          batch.update(doc.ref, {
            last_price_check: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        try {
          await batch.commit();
          processedCount += batchDocs.length;
          console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} offers`);
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Update job log with completion
      await db.collection('vendor_automation_jobs').doc(jobId).update({
        status: errors.length > 0 ? 'failed' : 'completed',
        completed_at: admin.firestore.Timestamp.now(),
        offers_processed: processedCount,
        errors: errors.length > 0 ? errors : admin.firestore.FieldValue.delete(),
        execution_time_ms: executionTime,
      });

      console.log(`Daily timestamp update completed. Processed ${processedCount} offers in ${executionTime}ms`);
      
      if (errors.length > 0) {
        console.error(`Completed with ${errors.length} errors`);
      }

      return null;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.error('Daily timestamp update failed:', errorMsg);

      // Update job log with failure
      try {
        await db.collection('vendor_automation_jobs').doc(jobId).update({
          status: 'failed',
          completed_at: admin.firestore.Timestamp.now(),
          errors: [errorMsg],
          execution_time_ms: executionTime,
        });
      } catch (logError) {
        console.error('Failed to update job log:', logError);
      }

      throw error; // Re-throw to mark function execution as failed
    }
  });

/**
 * Manual trigger for testing
 * Can be called via HTTP to test the timestamp update without waiting for schedule
 */
export const manualTimestampUpdate = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Verify admin authentication
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can trigger manual timestamp updates'
    );
  }

  const startTime = Date.now();
  const jobId = `manual_job_${startTime}`;
  
  console.log('Starting manual timestamp update job...');

  const jobLog: AutomationJobLog = {
    job_type: 'daily_timestamp_update',
    status: 'running',
    started_at: admin.firestore.Timestamp.now(),
    offers_processed: 0,
    errors: [],
  };

  try {
    await db.collection('vendor_automation_jobs').doc(jobId).set(jobLog);

    const offersSnapshot = await db
      .collection('vendor_offers')
      .where('status', '==', 'active')
      .where('verification_status', '==', 'verified')
      .get();

    console.log(`Found ${offersSnapshot.size} offers to update`);

    const batchSize = 500;
    let processedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < offersSnapshot.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = offersSnapshot.docs.slice(i, i + batchSize);

      batchDocs.forEach((doc) => {
        batch.update(doc.ref, {
          last_price_check: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      try {
        await batch.commit();
        processedCount += batchDocs.length;
      } catch (error) {
        const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
      }
    }

    const executionTime = Date.now() - startTime;

    await db.collection('vendor_automation_jobs').doc(jobId).update({
      status: errors.length > 0 ? 'failed' : 'completed',
      completed_at: admin.firestore.Timestamp.now(),
      offers_processed: processedCount,
      errors: errors.length > 0 ? errors : admin.firestore.FieldValue.delete(),
      execution_time_ms: executionTime,
    });

    console.log(`Manual timestamp update completed. Processed ${processedCount} offers in ${executionTime}ms`);

    return {
      success: true,
      message: `Updated timestamps for ${processedCount} offers`,
      executionTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    console.error('Manual timestamp update failed:', errorMsg);

    try {
      await db.collection('vendor_automation_jobs').doc(jobId).update({
        status: 'failed',
        completed_at: admin.firestore.Timestamp.now(),
        errors: [errorMsg],
        execution_time_ms: executionTime,
      });
    } catch (logError) {
      console.error('Failed to update job log:', logError);
    }

    throw new functions.https.HttpsError('internal', `Timestamp update failed: ${errorMsg}`);
  }
});

/**
 * Get automation job history
 * Returns recent automation jobs for admin monitoring
 */
export const getAutomationJobs = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Verify admin authentication
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can view automation jobs'
    );
  }

  const limit = data.limit || 50;

  try {
    const jobsSnapshot = await db
      .collection('vendor_automation_jobs')
      .orderBy('started_at', 'desc')
      .limit(limit)
      .get();

    const jobs = jobsSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      jobs,
      count: jobs.length,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new functions.https.HttpsError('internal', `Failed to fetch jobs: ${errorMsg}`);
  }
});

// ============================================================================
// STRIPE SUBSCRIPTION WEBHOOKS
// ============================================================================

// Export Stripe webhook handlers
export { handleStripeWebhook } from './webhooks/stripe-webhook';
export { createStripeCheckout } from './webhooks/create-stripe-checkout';

