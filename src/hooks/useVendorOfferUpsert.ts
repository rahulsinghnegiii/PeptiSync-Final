import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import type { VendorOffer, VendorTier } from '@/types/vendorComparison';

export interface UpsertResult {
  updated: number;
  created: number;
  unchanged: number;
  historyCreated: number;
}

interface OfferMatchKey {
  vendor_id: string;
  tier: VendorTier;
  peptide_name: string;
  size_mg?: number;
  glp_type?: string;
  dose_mg_per_injection?: number;
  dose_strength?: string;
}

export function useVendorOfferUpsert() {
  const [upserting, setUpserting] = useState(false);

  const upsertOffers = async (
    offers: any[],
    uploadBatchId: string,
    userId: string
  ): Promise<UpsertResult> => {
    setUpserting(true);
    const result: UpsertResult = { updated: 0, created: 0, unchanged: 0, historyCreated: 0 };

    try {
      for (const offer of offers) {
        // Match key: vendor_id + tier + peptide_name + size
        const matchKey = getOfferMatchKey(offer);
        
        // Query existing offer
        const existingOffer = await findExistingOffer(matchKey);
        
        if (existingOffer) {
          // Check if price changed
          const hasChanged = detectPriceChange(existingOffer, offer);
          
          if (hasChanged) {
            // Create history entry
            await createHistoryEntry(existingOffer, offer, uploadBatchId, userId);
            result.historyCreated++;
            
            // Update offer
            await updateDoc(doc(db, 'vendor_offers', existingOffer.id), {
              ...offer,
              upload_batch_id: uploadBatchId,
              last_upload_batch_id: uploadBatchId,
              updated_at: serverTimestamp(),
              submitted_by: userId,
            });
            result.updated++;
          } else {
            // Still update the batch tracking even if unchanged
            await updateDoc(doc(db, 'vendor_offers', existingOffer.id), {
              last_upload_batch_id: uploadBatchId,
              updated_at: serverTimestamp(),
            });
            result.unchanged++;
          }
        } else {
          // Create new offer
          await addDoc(collection(db, 'vendor_offers'), {
            ...offer,
            upload_batch_id: uploadBatchId,
            last_upload_batch_id: uploadBatchId,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            submitted_by: userId,
          });
          result.created++;
        }
      }

      return result;
    } catch (error: any) {
      console.error('Upsert error:', error);
      toast.error(`Upsert failed: ${error.message}`);
      throw error;
    } finally {
      setUpserting(false);
    }
  };

  return { upsertOffers, upserting };
}

// Helper: Generate match key based on tier
function getOfferMatchKey(offer: any): OfferMatchKey {
  if (offer.tier === 'research') {
    return {
      vendor_id: offer.vendor_id,
      tier: offer.tier,
      peptide_name: offer.peptide_name,
      size_mg: offer.research_pricing?.size_mg,
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

// Helper: Find existing offer
async function findExistingOffer(matchKey: OfferMatchKey): Promise<any | null> {
  const q = query(
    collection(db, 'vendor_offers'),
    where('vendor_id', '==', matchKey.vendor_id),
    where('tier', '==', matchKey.tier),
    where('peptide_name', '==', matchKey.peptide_name)
  );
  
  const snapshot = await getDocs(q);
  
  // Additional filtering by size/dose (not indexed)
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (matchesSizeOrDose(data, matchKey)) {
      return { id: docSnap.id, ...data };
    }
  }
  
  return null;
}

// Helper: Match size or dose based on tier
function matchesSizeOrDose(existingData: any, matchKey: OfferMatchKey): boolean {
  if (matchKey.tier === 'research') {
    return existingData.research_pricing?.size_mg === matchKey.size_mg;
  } else if (matchKey.tier === 'telehealth') {
    return (
      existingData.telehealth_pricing?.glp_type === matchKey.glp_type &&
      existingData.telehealth_pricing?.dose_mg_per_injection === matchKey.dose_mg_per_injection
    );
  } else {
    return existingData.brand_pricing?.dose_strength === matchKey.dose_strength;
  }
}

// Helper: Detect price changes
function detectPriceChange(existing: any, newOffer: any): boolean {
  if (existing.tier === 'research') {
    return (
      existing.research_pricing?.price_usd !== newOffer.research_pricing?.price_usd ||
      existing.research_pricing?.shipping_usd !== newOffer.research_pricing?.shipping_usd
    );
  } else if (existing.tier === 'telehealth') {
    return (
      existing.telehealth_pricing?.subscription_price_monthly !== newOffer.telehealth_pricing?.subscription_price_monthly ||
      existing.telehealth_pricing?.medication_cost_usd !== newOffer.telehealth_pricing?.medication_cost_usd
    );
  } else {
    return (
      existing.brand_pricing?.price_per_dose !== newOffer.brand_pricing?.price_per_dose ||
      existing.brand_pricing?.total_package_price !== newOffer.brand_pricing?.total_package_price
    );
  }
}

// Helper: Get changed fields
function getChangedFields(existing: any, newOffer: any): string[] {
  const changed: string[] = [];
  
  if (existing.tier === 'research') {
    if (existing.research_pricing?.price_usd !== newOffer.research_pricing?.price_usd) {
      changed.push('price_usd');
    }
    if (existing.research_pricing?.shipping_usd !== newOffer.research_pricing?.shipping_usd) {
      changed.push('shipping_usd');
    }
    if (existing.research_pricing?.price_per_mg !== newOffer.research_pricing?.price_per_mg) {
      changed.push('price_per_mg');
    }
  } else if (existing.tier === 'telehealth') {
    if (existing.telehealth_pricing?.subscription_price_monthly !== newOffer.telehealth_pricing?.subscription_price_monthly) {
      changed.push('subscription_price_monthly');
    }
    if (existing.telehealth_pricing?.medication_cost_usd !== newOffer.telehealth_pricing?.medication_cost_usd) {
      changed.push('medication_cost_usd');
    }
  } else {
    if (existing.brand_pricing?.price_per_dose !== newOffer.brand_pricing?.price_per_dose) {
      changed.push('price_per_dose');
    }
    if (existing.brand_pricing?.total_package_price !== newOffer.brand_pricing?.total_package_price) {
      changed.push('total_package_price');
    }
  }
  
  return changed;
}

// Helper: Calculate price change percentage
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

// Helper: Create history entry
async function createHistoryEntry(
  existing: any,
  newOffer: any,
  uploadBatchId: string,
  userId: string
) {
  const historyEntry = {
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
    upload_batch_id: uploadBatchId,
    changed_by: userId,
    changed_at: serverTimestamp(),
  };
  
  await addDoc(collection(db, 'vendor_offer_price_history'), historyEntry);
}

