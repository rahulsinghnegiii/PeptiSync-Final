/**
 * Setup all vendor URLs at once
 */

const https = require('https');

const CLOUD_FUNCTION_URL = 'https://us-central1-peptisync.cloudfunctions.net/setVendorUrlsPublic';

const VENDOR_URLS = {
  'Amino USA': [
    'https://aminousa.com/collections/peptides',
    'https://aminousa.com/products/bpc-157'
  ],
  'Peptide Sciences': [
    'https://www.peptidesciences.com/peptides.html',
    'https://www.peptidesciences.com/bpc-157'
  ],
  'Core Peptides': [
    'https://www.corepeptides.com',
    'https://www.corepeptides.com/peptides/',
    'https://www.corepeptides.com/peptides/bpc-157/',
    'https://www.corepeptides.com/peptides/tb-500/',
    'https://www.corepeptides.com/peptides/ipamorelin-5mg/',
    'https://www.corepeptides.com/peptides/bpc-157-tb-500-10mg-blend/',
    'https://www.corepeptides.com/peptides/cjc-1295-ipamorelin-10mg-blend/',
    'https://www.corepeptides.com/peptides/tesamorelin-ipamorelin-blend-8mg/'
  ],
  'Biotech Peptides': [
    'https://biotechpeptides.com',
    'https://biotechpeptides.com/product/bpc-157/',
    'https://biotechpeptides.com/product/tb-500-thymosin-beta-4-5mg/',
    'https://biotechpeptides.com/product/tb-500-10mg/',
    'https://biotechpeptides.com/product/ipamorelin-5mg/',
    'https://biotechpeptides.com/product/bpc-157-tb-500-10mg-blend-2/'
  ],
  'Limitless Life Nootropics': [
    'https://limitlesslifenootropics.com/product/bpc-157/'
  ],
  'Iron Mountain Labz': [
    'https://ironmountainlabz.com'
  ],
  'Longevity Peptides': [
    'https://www.longevitypeptides.us'
  ]
};

// Map vendor names to vendor IDs (will be populated by querying Firestore)
const VENDOR_IDS = {};

async function makeRequest(vendorName, urls) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      vendorId: 'TEMP_ID_' + vendorName.replace(/\s+/g, '_'),
      vendorName: vendorName,
      allowedUrls: urls
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(CLOUD_FUNCTION_URL, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setupAllVendors() {
  console.log('Setting up vendor URLs...\n');

  for (const [vendorName, urls] of Object.entries(VENDOR_URLS)) {
    try {
      console.log(`[${vendorName}] Setting ${urls.length} URLs...`);
      const result = await makeRequest(vendorName, urls);
      console.log(`✅ [${vendorName}] ${result.message}\n`);
    } catch (error) {
      console.error(`❌ [${vendorName}] Failed: ${error.message}\n`);
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n⚠️  IMPORTANT: These are using TEMPORARY IDs.');
  console.log('You need to update them with real Firestore vendor IDs.');
  console.log('Check the dropdown in your app to get the correct vendor IDs.');
}

setupAllVendors();

