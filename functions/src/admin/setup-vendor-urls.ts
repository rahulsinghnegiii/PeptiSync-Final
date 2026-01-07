/**
 * TEMPORARY: Public vendor URL setter for initial setup
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Set vendor URLs without auth (TEMPORARY for setup only)
 * Automatically finds vendor ID by name
 */
export const setVendorUrlsPublic = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { vendorName, allowedUrls } = req.body;

  if (!vendorName || !allowedUrls) {
    res.status(400).json({ error: 'vendorName and allowedUrls required' });
    return;
  }

  try {
    const db = admin.firestore();
    
    // Find vendor by name
    const vendorsSnapshot = await db.collection('vendors')
      .where('name', '==', vendorName)
      .limit(1)
      .get();
    
    if (vendorsSnapshot.empty) {
      res.status(404).json({ error: `Vendor "${vendorName}" not found in Firestore` });
      return;
    }
    
    const vendorId = vendorsSnapshot.docs[0].id;
    
    // Set URLs
    await db.collection('vendor_urls').doc(vendorId).set({
      vendor_id: vendorId,
      vendor_name: vendorName,
      allowed_urls: allowedUrls,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[SetVendorUrlsPublic] Set ${allowedUrls.length} URLs for ${vendorName} (${vendorId})`);

    res.json({
      success: true,
      message: `Set ${allowedUrls.length} URLs for ${vendorName}`,
      vendorId: vendorId,
    });
  } catch (error: any) {
    console.error('[SetVendorUrlsPublic] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

