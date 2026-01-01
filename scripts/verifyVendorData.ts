/**
 * Vendor Comparison V1 - Data Verification Script
 * 
 * Purpose: Automatically verify Firestore data integrity after seeding
 * Run: npx tsx scripts/verifyVendorData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config - use same as main app
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'peptisync',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface TestResult {
  test: string;
  passed: boolean;
  expected: number | string;
  actual: number | string;
  message?: string;
}

const results: TestResult[] = [];

async function runVerification() {
  console.log('🔍 Starting Vendor Comparison V1 Data Verification...\n');

  // Test 1: Vendor Count by Tier
  console.log('📊 Test 1: Vendor Count by Tier');
  await testVendorCountByTier();

  // Test 2: Offer Count by Tier
  console.log('📊 Test 2: Offer Count by Tier');
  await testOfferCountByTier();

  // Test 3: Tier 3 Reference Pricing
  console.log('📊 Test 3: Tier 3 Reference Pricing');
  await testTier3ReferencePricing();

  // Test 4: Offer-Vendor Relationships
  console.log('📊 Test 4: Offer-Vendor Relationships');
  await testOfferVendorRelationships();

  // Test 5: Verification Status
  console.log('📊 Test 5: Verification Status');
  await testVerificationStatus();

  // Test 6: Data Integrity
  console.log('📊 Test 6: Data Integrity');
  await testDataIntegrity();

  // Print Summary
  console.log('\n' + '='.repeat(60));
  printSummary();
}

async function testVendorCountByTier() {
  const tiers = [
    { tier: 'research', expected: 12 },
    { tier: 'telehealth', expected: 8 },
    { tier: 'brand', expected: 2 },
  ];

  for (const { tier, expected } of tiers) {
    const q = query(collection(db, 'vendors'), where('type', '==', tier));
    const snapshot = await getDocs(q);
    const actual = snapshot.size;

    results.push({
      test: `Vendor count - ${tier}`,
      passed: actual === expected,
      expected,
      actual,
    });

    console.log(`  ${tier.padEnd(12)}: ${actual}/${expected} ${actual === expected ? '✅' : '❌'}`);
  }
}

async function testOfferCountByTier() {
  const tiers = [
    { tier: 'research', expected: 5 },
    { tier: 'telehealth', expected: 5 },
    { tier: 'brand', expected: 5 },
  ];

  for (const { tier, expected } of tiers) {
    const q = query(collection(db, 'vendor_offers'), where('tier', '==', tier));
    const snapshot = await getDocs(q);
    const actual = snapshot.size;

    results.push({
      test: `Offer count - ${tier}`,
      passed: actual >= expected, // Allow more than expected (from uploads)
      expected: `>= ${expected}`,
      actual,
    });

    console.log(`  ${tier.padEnd(12)}: ${actual} (expected >= ${expected}) ${actual >= expected ? '✅' : '❌'}`);
  }
}

async function testTier3ReferencePricing() {
  const snapshot = await getDocs(collection(db, 'tier3_reference_pricing'));
  const actual = snapshot.size;
  const expected = 4;

  results.push({
    test: 'Tier 3 reference entries',
    passed: actual === expected,
    expected,
    actual,
  });

  console.log(`  Reference entries: ${actual}/${expected} ${actual === expected ? '✅' : '❌'}`);

  // Check for required products
  const products = ['Ozempic', 'Wegovy', 'Mounjaro', 'Zepbound'];
  const foundProducts: string[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    foundProducts.push(data.product_name);
  });

  for (const product of products) {
    const found = foundProducts.includes(product);
    console.log(`  ${product.padEnd(10)}: ${found ? '✅' : '❌'}`);
  }
}

async function testOfferVendorRelationships() {
  const offersSnapshot = await getDocs(collection(db, 'vendor_offers'));
  const vendorsSnapshot = await getDocs(collection(db, 'vendors'));
  
  const vendorIds = new Set<string>();
  vendorsSnapshot.forEach((doc) => vendorIds.add(doc.id));

  let validReferences = 0;
  let invalidReferences = 0;

  offersSnapshot.forEach((doc) => {
    const data = doc.data();
    if (vendorIds.has(data.vendor_id)) {
      validReferences++;
    } else {
      invalidReferences++;
      console.log(`  ❌ Invalid vendor_id in offer ${doc.id}: ${data.vendor_id}`);
    }
  });

  results.push({
    test: 'Offer-vendor relationships',
    passed: invalidReferences === 0,
    expected: 'All valid',
    actual: `${validReferences} valid, ${invalidReferences} invalid`,
  });

  console.log(`  Valid references: ${validReferences} ✅`);
  console.log(`  Invalid references: ${invalidReferences} ${invalidReferences === 0 ? '✅' : '❌'}`);
}

async function testVerificationStatus() {
  const snapshot = await getDocs(collection(db, 'vendor_offers'));
  
  let verified = 0;
  let unverified = 0;
  let pending = 0;
  let disputed = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    switch (data.verification_status) {
      case 'verified':
        verified++;
        break;
      case 'unverified':
        unverified++;
        break;
      case 'pending':
        pending++;
        break;
      case 'disputed':
        disputed++;
        break;
    }
  });

  console.log(`  Verified: ${verified} ✅`);
  console.log(`  Unverified: ${unverified}`);
  console.log(`  Pending: ${pending}`);
  console.log(`  Disputed: ${disputed}`);

  results.push({
    test: 'Verification status distribution',
    passed: verified > 0, // At least some verified
    expected: '> 0 verified',
    actual: `${verified} verified`,
  });
}

async function testDataIntegrity() {
  const offersSnapshot = await getDocs(collection(db, 'vendor_offers'));
  
  let missingFields = 0;
  let invalidPricing = 0;
  
  offersSnapshot.forEach((doc) => {
    const data = doc.data();
    
    // Check required fields
    const requiredFields = ['vendor_id', 'tier', 'peptide_name', 'verification_status', 'created_at'];
    for (const field of requiredFields) {
      if (!data[field]) {
        missingFields++;
        console.log(`  ❌ Missing field "${field}" in offer ${doc.id}`);
      }
    }

    // Check tier-specific pricing
    if (data.tier === 'research') {
      if (!data.research_pricing || typeof data.research_pricing.price_usd !== 'number') {
        invalidPricing++;
        console.log(`  ❌ Invalid research pricing in offer ${doc.id}`);
      }
    } else if (data.tier === 'telehealth') {
      if (!data.telehealth_pricing || typeof data.telehealth_pricing.subscription_monthly_usd !== 'number') {
        invalidPricing++;
        console.log(`  ❌ Invalid telehealth pricing in offer ${doc.id}`);
      }
    } else if (data.tier === 'brand') {
      if (!data.brand_pricing || typeof data.brand_pricing.price_per_dose_usd !== 'number') {
        invalidPricing++;
        console.log(`  ❌ Invalid brand pricing in offer ${doc.id}`);
      }
    }
  });

  results.push({
    test: 'Data integrity - missing fields',
    passed: missingFields === 0,
    expected: '0 missing',
    actual: `${missingFields} missing`,
  });

  results.push({
    test: 'Data integrity - invalid pricing',
    passed: invalidPricing === 0,
    expected: '0 invalid',
    actual: `${invalidPricing} invalid`,
  });

  console.log(`  Missing fields: ${missingFields} ${missingFields === 0 ? '✅' : '❌'}`);
  console.log(`  Invalid pricing: ${invalidPricing} ${invalidPricing === 0 ? '✅' : '❌'}`);
}

function printSummary() {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed === 0 ? '✅' : '❌'}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  • ${r.test}`);
        console.log(`    Expected: ${r.expected}`);
        console.log(`    Actual: ${r.actual}`);
      });
  }

  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('✅ All tests passed! Data integrity verified.');
    console.log('✅ V1 data layer is ready for testing.');
  } else {
    console.log('❌ Some tests failed. Please review and fix issues.');
    console.log('❌ Do not proceed to production until all tests pass.');
  }
}

// Run verification
runVerification()
  .then(() => {
    process.exit(results.every((r) => r.passed) ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Verification failed with error:', error);
    process.exit(1);
  });

