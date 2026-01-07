/**
 * Vendor URL Management Cloud Functions
 * 
 * Admin-only functions for managing vendor URL whitelists
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Save vendor URL configuration
 * Admin-only callable function
 */
export const saveVendorUrls = functions.https.onCall(async (data, context) => {
  // Check admin auth
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { vendorId, vendorName, allowedUrls } = data;

  if (!vendorId || !vendorName || !allowedUrls || !Array.isArray(allowedUrls)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'vendorId, vendorName, and allowedUrls (array) required'
    );
  }

  // Validate URLs
  for (const url of allowedUrls) {
    try {
      new URL(url);
    } catch (e) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid URL: ${url}`);
    }
  }

  try {
    const db = admin.firestore();
    await db.collection('vendor_urls').doc(vendorId).set({
      vendor_id: vendorId,
      vendor_name: vendorName,
      allowed_urls: allowedUrls,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[SaveVendorUrls] Saved ${allowedUrls.length} URLs for ${vendorName}`);

    return {
      success: true,
      message: `Configuration saved for ${vendorName}`,
    };
  } catch (error: any) {
    console.error('[SaveVendorUrls] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Get vendor URL configuration
 * Admin-only callable function
 */
export const getVendorUrls = functions.https.onCall(async (data, context) => {
  // Check admin auth
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { vendorId } = data;

  if (!vendorId) {
    throw new functions.https.HttpsError('invalid-argument', 'vendorId required');
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection('vendor_urls').doc(vendorId).get();

    if (!doc.exists) {
      return {
        success: true,
        config: null,
      };
    }

    return {
      success: true,
      config: doc.data(),
    };
  } catch (error: any) {
    console.error('[GetVendorUrls] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

