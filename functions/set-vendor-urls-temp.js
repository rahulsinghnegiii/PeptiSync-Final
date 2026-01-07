const admin = require('firebase-admin');

// Initialize
admin.initializeApp({
  projectId: 'peptisync'
});

async function setVendorUrls() {
  try {
    const db = admin.firestore();
    
    // Set Amino USA vendor URLs
    await db.collection('vendor_urls').doc('VENDOR_ID_HERE').set({
      vendor_id: 'VENDOR_ID_HERE',
      vendor_name: 'Amino USA',
      allowed_urls: ['https://aminousa.com/shop'],
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Vendor URLs set successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setVendorUrls();

