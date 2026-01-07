/**
 * Scraper Runner
 * 
 * Orchestrates scraping for all configured vendors
 * Handles job tracking, error isolation, and Firestore upserts
 */

import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import {
  ScraperJob,
  ScraperJobVendor,
  ScraperJobItem,
  ScraperResult,
  VendorScraper,
} from './types';
import { getAllVendorScrapers } from './vendors';
import { upsertVendorOffers, UpsertResult } from '../shared/vendor-offer-upsert-core';
import { buildResearchPricing } from '../shared/validation-utils';

/**
 * Run all configured scrapers
 */
export async function runAllScrapers(
  triggerType: 'scheduled' | 'manual',
  triggeredBy?: string
): Promise<string> {
  const db = admin.firestore();
  const jobId = uuidv4();

  console.log(`[Runner] Starting job ${jobId} (${triggerType})`);

  // Initialize job
  const job: ScraperJob = {
    job_id: jobId,
    trigger_type: triggerType,
    triggered_by: triggeredBy,
    started_at: new Date(),
    status: 'running',
    vendors_succeeded: 0,
    vendors_failed: 0,
    total_products_scraped: 0,
    total_products_valid: 0,
    total_created: 0,
    total_updated: 0,
    total_unchanged: 0,
    error_messages: [],
  };

  // Save initial job state (exclude undefined fields)
  const jobData: any = {
    job_id: jobId,
    trigger_type: triggerType,
    started_at: admin.firestore.FieldValue.serverTimestamp(),
    status: 'running',
    vendors_succeeded: 0,
    vendors_failed: 0,
    total_products_scraped: 0,
    total_products_valid: 0,
    total_created: 0,
    total_updated: 0,
    total_unchanged: 0,
    error_messages: [],
  };
  
  // Only include triggered_by if it's defined
  if (triggeredBy) {
    jobData.triggered_by = triggeredBy;
  }
  
  await db.collection('scraper_jobs').doc(jobId).set(jobData);

  // Load scrapers dynamically
  const scrapers = await getAllVendorScrapers(db);

  if (scrapers.length === 0) {
    const error = 'No vendors configured for scraping';
    console.error(`[Runner] ${error}`);
    await updateJobStatus(db, jobId, 'failed', [error]);
    return jobId;
  }

  console.log(`[Runner] Loaded ${scrapers.length} configured vendor scrapers`);

  // Run each scraper (isolated failures)
  for (const scraper of scrapers) {
    // Check if job was cancelled
    const jobDoc = await db.collection('scraper_jobs').doc(jobId).get();
    const currentJob = jobDoc.data();
    
    if (currentJob?.status === 'cancelled') {
      console.log(`[Runner] Job ${jobId} was cancelled, stopping execution`);
      return jobId;
    }

    try {
      await runVendorScraper(db, jobId, scraper, job);
      job.vendors_succeeded++;
    } catch (error: any) {
      console.error(`[Runner] Vendor ${scraper.name} failed:`, error.message);
      job.vendors_failed++;
      job.error_messages.push(`${scraper.name}: ${error.message}`);
    }
  }

  // Finalize job
  job.completed_at = new Date();
  job.status = job.vendors_failed === scrapers.length ? 'failed' : 'completed';

  await db.collection('scraper_jobs').doc(jobId).update({
    completed_at: admin.firestore.FieldValue.serverTimestamp(),
    status: job.status,
    vendors_succeeded: job.vendors_succeeded,
    vendors_failed: job.vendors_failed,
    total_products_scraped: job.total_products_scraped,
    total_products_valid: job.total_products_valid,
    total_created: job.total_created,
    total_updated: job.total_updated,
    total_unchanged: job.total_unchanged,
    error_messages: job.error_messages,
  });

  console.log(`[Runner] Job ${jobId} completed:`);
  console.log(`  - Vendors succeeded: ${job.vendors_succeeded}`);
  console.log(`  - Vendors failed: ${job.vendors_failed}`);
  console.log(`  - Products scraped: ${job.total_products_scraped}`);
  console.log(`  - Products valid: ${job.total_products_valid}`);
  console.log(`  - Created: ${job.total_created}`);
  console.log(`  - Updated: ${job.total_updated}`);
  console.log(`  - Unchanged: ${job.total_unchanged}`);

  return jobId;
}

/**
 * Run scraper for a single vendor
 */
async function runVendorScraper(
  db: admin.firestore.Firestore,
  jobId: string,
  scraper: VendorScraper,
  job: ScraperJob
): Promise<void> {
  console.log(`[${scraper.name}] Starting scraper...`);

  const vendorJob: ScraperJobVendor = {
    job_id: jobId,
    vendor_id: scraper.vendorId,
    vendor_name: scraper.name,
    status: 'success',
    started_at: new Date(),
    pages_visited: 0,
    products_found: 0,
    products_scraped: 0,
    products_valid: 0,
    products_failed: 0,
    offers_created: 0,
    offers_updated: 0,
    offers_unchanged: 0,
    validation_failures: {},
    errors: [],
    warnings: [],
  };

  try {
    // Run scraper
    const results = await scraper.scrape();
    vendorJob.products_found = results.length;
    vendorJob.products_scraped = results.length;

    // Count valid/invalid
    const validResults = results.filter(r => r.valid);
    const invalidResults = results.filter(r => !r.valid);

    vendorJob.products_valid = validResults.length;
    vendorJob.products_failed = invalidResults.length;

    // Track validation failures
    for (const result of invalidResults) {
      if (result.validation_error) {
        vendorJob.validation_failures[result.validation_error] =
          (vendorJob.validation_failures[result.validation_error] || 0) + 1;
      }
    }

    // Build vendor offers from valid results
    console.log(`[${scraper.name}] Building offers from ${validResults.length} valid results...`);
    
    // Count products with/without size
    const withSize = validResults.filter(r => r.size_mg != null && r.size_mg > 0).length;
    const withoutSize = validResults.length - withSize;
    console.log(`[${scraper.name}] Size extraction: ${withSize} have size, ${withoutSize} missing size (${Math.round(withSize/validResults.length*100)}% success rate)`);
    
    // Log sample of first few products for debugging
    const sampleSize = Math.min(5, validResults.length);
    console.log(`[${scraper.name}] Sample products (first ${sampleSize}):`);
    for (let i = 0; i < sampleSize; i++) {
      const r = validResults[i];
      const sizeStr = r.size_mg ? `${r.size_mg}mg` : '❌ MISSING';
      const priceStr = r.price_usd ? `$${r.price_usd}` : '❌ MISSING';
      console.log(`  ${i + 1}. "${r.peptide_name.substring(0, 40)}" - Size: ${sizeStr}, Price: ${priceStr}`);
    }
    
    const allOffers = validResults.map(result => buildVendorOffer(scraper.vendorId, result));
    const offers = allOffers.filter(offer => offer !== null);
    
    const rejectedCount = allOffers.length - offers.length;
    console.log(`[${scraper.name}] 📊 OFFER BUILD RESULT: ${offers.length} valid offers, ${rejectedCount} rejected (${Math.round(offers.length/validResults.length*100)}% conversion)`);
    
    if (offers.length > 0) {
      console.log(`[${scraper.name}] ✅ Sample valid offer:`, {
        peptide: offers[0].peptide_name,
        size: offers[0].research_pricing?.size_mg,
        price: offers[0].research_pricing?.price_usd,
      });
    }
    
    if (rejectedCount > 0) {
      console.warn(`[${scraper.name}] ⚠️  ${rejectedCount} products rejected - analyzing rejection reasons...`);
      const missingSize = validResults.filter(r => !r.size_mg || r.size_mg <= 0).length;
      const missingPrice = validResults.filter(r => !r.price_usd || r.price_usd <= 0).length;
      console.log(`[${scraper.name}] Rejection breakdown: ${missingSize} missing size, ${missingPrice} missing price`);
      
      if (missingSize > 0) {
        console.log(`[${scraper.name}] Sample products without size:`);
        validResults.filter(r => !r.size_mg).slice(0, 3).forEach((r, i) => {
          console.log(`  ${i + 1}. "${r.peptide_name}" - URL: ${r.product_url?.substring(0, 60)}...`);
        });
      }
    }

    // Initialize upsert result
    let upsertResult = {
      created: 0,
      updated: 0,
      unchanged: 0,
      historyCreated: 0,
    };

    // Upsert to Firestore
    if (offers.length > 0) {
      console.log(`[${scraper.name}] Upserting ${offers.length} offers to Firestore...`);
      upsertResult = await upsertVendorOffers(
        db,
        offers,
        jobId,
        undefined,
        jobId
      );

      console.log(`[${scraper.name}] Upsert result:`, {
        created: upsertResult.created,
        updated: upsertResult.updated,
        unchanged: upsertResult.unchanged,
        historyCreated: upsertResult.historyCreated,
      });

      vendorJob.offers_created = upsertResult.created;
      vendorJob.offers_updated = upsertResult.updated;
      vendorJob.offers_unchanged = upsertResult.unchanged;
    } else {
      console.warn(`[${scraper.name}] No valid offers to upsert`);
    }

    // Update job totals
    job.total_products_scraped += vendorJob.products_scraped;
    job.total_products_valid += vendorJob.products_valid;
    job.total_created += vendorJob.offers_created;
    job.total_updated += vendorJob.offers_updated;
    job.total_unchanged += vendorJob.offers_unchanged;

    // Store items (cost-controlled)
    await storeScraperItems(
      db,
      jobId,
      scraper,
      results,
      upsertResult
    );

    // Determine status
    if (vendorJob.products_valid === 0) {
      vendorJob.status = 'failed';
      vendorJob.errors.push('No valid products scraped');
    } else if (vendorJob.products_failed > 0) {
      vendorJob.status = 'partial';
    }
  } catch (error: any) {
    vendorJob.status = 'failed';
    vendorJob.errors.push(error.message);
    throw error;
  } finally {
    vendorJob.completed_at = new Date();

    // Save vendor job
    await db
      .collection('scraper_jobs')
      .doc(jobId)
      .collection('vendors')
      .doc(scraper.vendorId)
      .set({
        ...vendorJob,
        started_at: admin.firestore.Timestamp.fromDate(vendorJob.started_at),
        completed_at: vendorJob.completed_at
          ? admin.firestore.Timestamp.fromDate(vendorJob.completed_at)
          : null,
      });

    console.log(`[${scraper.name}] Scraper completed:`);
    console.log(`  - Status: ${vendorJob.status}`);
    console.log(`  - Products found: ${vendorJob.products_found}`);
    console.log(`  - Products valid: ${vendorJob.products_valid}`);
    console.log(`  - Created: ${vendorJob.offers_created}`);
    console.log(`  - Updated: ${vendorJob.offers_updated}`);
    console.log(`  - Unchanged: ${vendorJob.offers_unchanged}`);
  }
}

/**
 * Build vendor offer from scraper result
 * Returns null if pricing is invalid
 */
function buildVendorOffer(vendorId: string, result: ScraperResult): any | null {
  // Detailed logging for debugging
  const hasSize = result.size_mg != null && result.size_mg > 0;
  const hasPrice = result.price_usd != null && result.price_usd > 0;
  
  if (!hasSize || !hasPrice) {
    console.warn(`[buildVendorOffer] Rejecting "${result.peptide_name}" - Missing data: ${!hasSize ? 'size_mg' : ''} ${!hasPrice ? 'price_usd' : ''} (size: ${result.size_mg}, price: ${result.price_usd})`);
  }
  
  const researchPricing = buildResearchPricing({
    size_mg: result.size_mg,
    price_usd: result.price_usd,
    shipping_usd: result.shipping_usd || 0,
  });

  // If pricing is invalid, skip this offer
  if (!researchPricing) {
    return null;
  }

  // Build offer object, only including defined values
  const offer: any = {
    vendor_id: vendorId,
    tier: 'research',
    peptide_name: result.peptide_name,
    research_pricing: researchPricing,
    price_source_type: 'automated_scrape',
    verification_status: 'unverified',
    last_scraped_at: admin.firestore.FieldValue.serverTimestamp(),
    last_checked: admin.firestore.FieldValue.serverTimestamp(),
    last_price_check: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Only add optional fields if they have values
  if (result.vendor_url) {
    offer.vendor_url = result.vendor_url;
  }
  if (result.product_url) {
    offer.product_url = result.product_url;
  }

  return offer;
}

/**
 * Store scraper items (cost-controlled)
 */
async function storeScraperItems(
  db: admin.firestore.Firestore,
  jobId: string,
  scraper: VendorScraper,
  results: ScraperResult[],
  upsertResult: UpsertResult
): Promise<void> {
  const itemsToStore: ScraperJobItem[] = [];
  let unchangedCount = 0;

  for (const result of results) {
    const shouldStore = shouldStoreItem(result, unchangedCount, upsertResult);

    if (shouldStore.store) {
      // Build base item with required fields only
      const item: any = {
        job_id: jobId,
        vendor_id: scraper.vendorId,
        vendor_name: scraper.name,
        peptide_name: result.peptide_name,
        status: result.valid ? 'success' : 'validation_failed',
        storage_reason: shouldStore.reason,
        scraped_at: result.scraped_at,
      };

      // Only add optional fields if they have values
      if (result.product_url) item.product_url = result.product_url;
      if (result.raw_price_text) item.raw_price_text = result.raw_price_text;
      if (result.raw_size_text) item.raw_size_text = result.raw_size_text;
      if (result.size_mg != null) item.size_mg = result.size_mg;
      if (result.price_usd != null) item.price_usd = result.price_usd;
      if (result.shipping_usd != null) item.shipping_usd = result.shipping_usd;
      if (result.validation_error) item.validation_error = result.validation_error;
      
      if (result.valid && shouldStore.action) {
        item.firestore_action = { action: shouldStore.action };
      }

      itemsToStore.push(item);

      if (shouldStore.reason === 'sample_unchanged') {
        unchangedCount++;
      }
    }
  }

  // Batch write items
  const batch = db.batch();
  for (const item of itemsToStore) {
    const docRef = db
      .collection('scraper_jobs')
      .doc(jobId)
      .collection('vendors')
      .doc(scraper.vendorId)
      .collection('items')
      .doc();

    batch.set(docRef, {
      ...item,
      scraped_at: admin.firestore.Timestamp.fromDate(item.scraped_at),
    });
  }

  await batch.commit();

  console.log(`[${scraper.name}] Stored ${itemsToStore.length} items (out of ${results.length} total)`);
}

/**
 * Determine if an item should be stored
 */
function shouldStoreItem(
  result: ScraperResult,
  unchangedCount: number,
  upsertResult: UpsertResult
): { store: boolean; reason: 'failed' | 'validation_failed' | 'created' | 'updated' | 'sample_unchanged'; action?: 'created' | 'updated' | 'unchanged' } {
  // Always store failures
  if (!result.valid) {
    return { store: true, reason: 'validation_failed' };
  }

  // Store created/updated (we can't easily determine this per-item without more complex tracking)
  // For V1, we'll use a simplified approach: store a sample of all valid items

  // Store first 10 unchanged successful items as sample
  if (unchangedCount < 10) {
    return { store: true, reason: 'sample_unchanged', action: 'unchanged' };
  }

  // Don't store the rest
  return { store: false, reason: 'sample_unchanged' };
}

/**
 * Update job status
 */
async function updateJobStatus(
  db: admin.firestore.Firestore,
  jobId: string,
  status: 'running' | 'completed' | 'failed',
  errors: string[] = []
): Promise<void> {
  await db.collection('scraper_jobs').doc(jobId).update({
    status,
    error_messages: errors,
    completed_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

