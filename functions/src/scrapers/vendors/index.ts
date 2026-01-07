/**
 * Vendor Scrapers Index
 * 
 * Dynamically loads all configured vendors from Firestore
 * No hard-coded vendor IDs
 */

import * as admin from 'firebase-admin';
import { VendorScraper } from '../types';
import { createVendorScraper } from './generic-scraper';

/**
 * Get scrapers for all configured vendors
 * Vendor IDs and names loaded from Firestore at runtime
 */
export async function getAllVendorScrapers(
  db: admin.firestore.Firestore
): Promise<VendorScraper[]> {
  console.log('[VendorScrapers] Loading configured vendors...');

  // Query all Tier-1 (research) vendors
  const vendorsSnapshot = await db
    .collection('vendors')
    .where('type', '==', 'research')
    .get();

  const scrapers: VendorScraper[] = [];

  for (const doc of vendorsSnapshot.docs) {
    const vendor = doc.data();

    // Check if scraping is configured
    const urlDoc = await db.collection('vendor_urls').doc(doc.id).get();

    if (urlDoc.exists) {
      // Create scraper dynamically
      const scraper = createVendorScraper(doc.id, vendor.name);
      scrapers.push(scraper);
      console.log(`[VendorScrapers] Loaded scraper for ${vendor.name}`);
    } else {
      console.warn(`[VendorScrapers] ${vendor.name} has no URL configuration - skipping`);
    }
  }

  console.log(`[VendorScrapers] Loaded ${scrapers.length} configured vendor scrapers`);

  return scrapers;
}

/**
 * Get scraper for a single vendor
 */
export async function getVendorScraper(
  db: admin.firestore.Firestore,
  vendorId: string
): Promise<VendorScraper | null> {
  const vendorDoc = await db.collection('vendors').doc(vendorId).get();

  if (!vendorDoc.exists) {
    console.error(`[VendorScrapers] Vendor ${vendorId} not found`);
    return null;
  }

  const vendor = vendorDoc.data();

  // Check if scraping is configured
  const urlDoc = await db.collection('vendor_urls').doc(vendorId).get();

  if (!urlDoc.exists) {
    console.error(`[VendorScrapers] Vendor ${vendor?.name} has no URL configuration`);
    return null;
  }

  return createVendorScraper(vendorId, vendor?.name || 'Unknown Vendor');
}

