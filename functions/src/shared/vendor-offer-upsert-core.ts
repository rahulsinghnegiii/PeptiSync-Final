/**
 * Shared Core Logic: Vendor Offer Upsert
 * 
 * Pure Node.js module - no React, no browser APIs
 * Used by both:
 * - Frontend hooks (via Firebase SDK)
 * - Cloud Functions (via Firebase Admin SDK)
 * 
 * Key Responsibilities:
 * - Find existing offers
 * - Detect price changes
 * - Create history entries
 * - Upsert offers to Firestore
 */

import * as admin from 'firebase-admin';

export interface UpsertResult {
  updated: number;
  created: number;
  unchanged: number;
  historyCreated: number;
}

export interface OfferMatchKey {
  vendor_id: string;
  tier: 'research' | 'telehealth' | 'brand';
  peptide_name: string;
  size_mg?: number;
  glp_type?: string;
  dose_mg_per_injection?: number;
  dose_strength?: string;
}

interface PriceHistoryEntry {
  offer_id: string;
  vendor_id: string;
  tier: string;
  peptide_name: string;
  old_research_pricing: any;
  old_telehealth_pricing: any;
  old_brand_pricing: any;
  new_research_pricing: any;
  new_telehealth_pricing: any;
  new_brand_pricing: any;
  changed_fields: string[];
  price_change_pct?: number;
  upload_batch_id?: string;
  scraper_job_id?: string;
  changed_by?: string;
  changed_at: admin.firestore.FieldValue;
}

/**
 * Remove undefined values from an object to prevent Firestore errors
 */
function cleanObject(obj: any): any {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

/**
 * Core upsert logic for vendor offers
 * Compatible with both Firebase SDK and Admin SDK
 */
export async function upsertVendorOffers(
  db: admin.firestore.Firestore,
  offers: any[],
  batchId: string,
  userId?: string,
  scraperJobId?: string
): Promise<UpsertResult> {
  const result: UpsertResult = {
    updated: 0,
    created: 0,
    unchanged: 0,
    historyCreated: 0,
  };

  for (const offer of offers) {
    try {
      // Generate match key
      const matchKey = getOfferMatchKey(offer);

      // Find existing offer
      const existingOffer = await findExistingOffer(db, matchKey);

      if (existingOffer) {
        // Check if price changed
        const hasChanged = detectPriceChange(existingOffer, offer);

        if (hasChanged) {
          // Create history entry
          await createHistoryEntry(
            db,
            existingOffer,
            offer,
            batchId,
            userId,
            scraperJobId
          );
          result.historyCreated++;

          // Update offer (preserve verification_status and last_checked from new scrape)
          const updateData = cleanObject({
            ...offer,
            verification_status: existingOffer.verification_status || 'unverified',
            upload_batch_id: batchId,
            last_upload_batch_id: batchId,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            last_checked: offer.last_checked || admin.firestore.FieldValue.serverTimestamp(),
            last_price_check: admin.firestore.FieldValue.serverTimestamp(),
            submitted_by: userId || 'system',
          });
          
          await db.collection('vendor_offers').doc(existingOffer.id).update(updateData);
          result.updated++;
        } else {
          // Still update the batch tracking and last_checked even if price unchanged
          const updateData = cleanObject({
            last_upload_batch_id: batchId,
            last_checked: offer.last_checked || admin.firestore.FieldValue.serverTimestamp(),
            last_price_check: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          await db.collection('vendor_offers').doc(existingOffer.id).update(updateData);
          result.unchanged++;
        }
      } else {
        // Create new offer (ensure verification_status and last_price_check are set)
        const newOfferData = cleanObject({
          ...offer,
          verification_status: offer.verification_status || 'unverified',
          upload_batch_id: batchId,
          last_upload_batch_id: batchId,
          last_checked: offer.last_checked || admin.firestore.FieldValue.serverTimestamp(),
          last_price_check: admin.firestore.FieldValue.serverTimestamp(),
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          submitted_by: userId || 'system',
        });
        
        await db.collection('vendor_offers').add(newOfferData);
        result.created++;
      }
    } catch (error) {
      console.error(`Error upserting offer for ${offer.peptide_name}:`, error);
      throw error;
    }
  }

  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate match key based on tier
 * For research tier: Match ONLY by vendor_id + peptide_name (no size_mg)
 * This allows updating existing offers when size changes
 */
function getOfferMatchKey(offer: any): OfferMatchKey {
  if (offer.tier === 'research') {
    return {
      vendor_id: offer.vendor_id,
      tier: offer.tier,
      peptide_name: offer.peptide_name,
      // Note: Intentionally NOT including size_mg to avoid duplicates
      // When size changes, we update the existing offer
    };
  } else if (offer.tier === 'telehealth') {
    return {
      vendor_id: offer.vendor_id,
      tier: offer.tier,
      peptide_name: offer.peptide_name,
      glp_type: offer.telehealth_pricing?.glp_type,
      dose_mg_per_injection: offer.telehealth_pricing?.dose_mg_per_injection,
    };
  } else {
    return {
      vendor_id: offer.vendor_id,
      tier: offer.tier,
      peptide_name: offer.peptide_name,
      dose_strength: offer.brand_pricing?.dose_strength,
    };
  }
}

/**
 * Find existing offer in Firestore
 * For research tier: Match by vendor + peptide name only (ignore size)
 */
async function findExistingOffer(
  db: admin.firestore.Firestore,
  matchKey: OfferMatchKey
): Promise<any | null> {
  const snapshot = await db
    .collection('vendor_offers')
    .where('vendor_id', '==', matchKey.vendor_id)
    .where('tier', '==', matchKey.tier)
    .where('peptide_name', '==', matchKey.peptide_name)
    .get();

  // For research tier, return first match (we match by name only, not size)
  if (matchKey.tier === 'research' && snapshot.docs.length > 0) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // For other tiers, additional filtering by size/dose (not indexed)
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (matchesSizeOrDose(data, matchKey)) {
      return { id: doc.id, ...data };
    }
  }

  return null;
}

/**
 * Match size or dose based on tier
 * For research tier: Always match (we don't filter by size)
 */
function matchesSizeOrDose(existingData: any, matchKey: OfferMatchKey): boolean {
  if (matchKey.tier === 'research') {
    // Always match for research tier (we match by name only)
    return true;
  } else if (matchKey.tier === 'telehealth') {
    return (
      existingData.telehealth_pricing?.glp_type === matchKey.glp_type &&
      existingData.telehealth_pricing?.dose_mg_per_injection === matchKey.dose_mg_per_injection
    );
  } else {
    return existingData.brand_pricing?.dose_strength === matchKey.dose_strength;
  }
}

/**
 * Detect price changes (or size changes for research tier)
 */
function detectPriceChange(existing: any, newOffer: any): boolean {
  if (existing.tier === 'research') {
    return (
      existing.research_pricing?.price_usd !== newOffer.research_pricing?.price_usd ||
      existing.research_pricing?.shipping_usd !== newOffer.research_pricing?.shipping_usd ||
      existing.research_pricing?.size_mg !== newOffer.research_pricing?.size_mg // Size change also triggers update
    );
  } else if (existing.tier === 'telehealth') {
    return (
      existing.telehealth_pricing?.subscription_price_monthly !==
        newOffer.telehealth_pricing?.subscription_price_monthly ||
      existing.telehealth_pricing?.medication_cost_usd !==
        newOffer.telehealth_pricing?.medication_cost_usd
    );
  } else {
    return (
      existing.brand_pricing?.price_per_dose !== newOffer.brand_pricing?.price_per_dose ||
      existing.brand_pricing?.total_package_price !== newOffer.brand_pricing?.total_package_price
    );
  }
}

/**
 * Get changed fields
 */
function getChangedFields(existing: any, newOffer: any): string[] {
  const changed: string[] = [];

  if (existing.tier === 'research') {
    if (existing.research_pricing?.price_usd !== newOffer.research_pricing?.price_usd) {
      changed.push('price_usd');
    }
    if (existing.research_pricing?.shipping_usd !== newOffer.research_pricing?.shipping_usd) {
      changed.push('shipping_usd');
    }
    if (existing.research_pricing?.size_mg !== newOffer.research_pricing?.size_mg) {
      changed.push('size_mg');
    }
    if (existing.research_pricing?.price_per_mg !== newOffer.research_pricing?.price_per_mg) {
      changed.push('price_per_mg');
    }
  } else if (existing.tier === 'telehealth') {
    if (
      existing.telehealth_pricing?.subscription_price_monthly !==
      newOffer.telehealth_pricing?.subscription_price_monthly
    ) {
      changed.push('subscription_price_monthly');
    }
    if (
      existing.telehealth_pricing?.medication_cost_usd !==
      newOffer.telehealth_pricing?.medication_cost_usd
    ) {
      changed.push('medication_cost_usd');
    }
  } else {
    if (existing.brand_pricing?.price_per_dose !== newOffer.brand_pricing?.price_per_dose) {
      changed.push('price_per_dose');
    }
    if (
      existing.brand_pricing?.total_package_price !== newOffer.brand_pricing?.total_package_price
    ) {
      changed.push('total_package_price');
    }
  }

  return changed;
}

/**
 * Calculate price change percentage
 */
function calculatePriceChangePct(existing: any, newOffer: any): number | undefined {
  let oldPrice = 0;
  let newPrice = 0;

  if (existing.tier === 'research') {
    oldPrice = existing.research_pricing?.price_per_mg || 0;
    newPrice = newOffer.research_pricing?.price_per_mg || 0;
  } else if (existing.tier === 'telehealth') {
    oldPrice = existing.telehealth_pricing?.subscription_price_monthly || 0;
    newPrice = newOffer.telehealth_pricing?.subscription_price_monthly || 0;
  } else {
    oldPrice = existing.brand_pricing?.price_per_dose || 0;
    newPrice = newOffer.brand_pricing?.price_per_dose || 0;
  }

  if (oldPrice === 0) return undefined;

  return Math.round(((newPrice - oldPrice) / oldPrice) * 100 * 100) / 100;
}

/**
 * Create history entry
 */
async function createHistoryEntry(
  db: admin.firestore.Firestore,
  existing: any,
  newOffer: any,
  batchId: string,
  userId?: string,
  scraperJobId?: string
) {
  const historyEntry: PriceHistoryEntry = {
    offer_id: existing.id,
    vendor_id: existing.vendor_id,
    tier: existing.tier,
    peptide_name: existing.peptide_name,
    old_research_pricing: existing.research_pricing || null,
    old_telehealth_pricing: existing.telehealth_pricing || null,
    old_brand_pricing: existing.brand_pricing || null,
    new_research_pricing: newOffer.research_pricing || null,
    new_telehealth_pricing: newOffer.telehealth_pricing || null,
    new_brand_pricing: newOffer.brand_pricing || null,
    changed_fields: getChangedFields(existing, newOffer),
    price_change_pct: calculatePriceChangePct(existing, newOffer),
    changed_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (batchId) {
    historyEntry.upload_batch_id = batchId;
  }

  if (scraperJobId) {
    historyEntry.scraper_job_id = scraperJobId;
  }

  if (userId) {
    historyEntry.changed_by = userId;
  }

  await db.collection('vendor_offer_price_history').add(historyEntry);
}

