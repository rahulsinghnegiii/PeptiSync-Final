/**
 * Vendor Comparison V1 - Seed Data Script
 * 
 * This script seeds the Firestore database with initial vendor and offer data
 * for Vendor Comparison V1 feature.
 * 
 * Usage:
 * npm run seed:vendors
 * 
 * Or run directly:
 * npx tsx scripts/seedVendorData.ts
 * 
 * Note: Requires admin Firebase credentials or running in authenticated context
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

// For production seeding, use Firebase Admin SDK with service account
// For local development, use regular Firebase SDK with .env credentials

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================================
// TYPES
// ============================================================================

type VendorTier = 'research' | 'telehealth' | 'brand';

interface VendorSeedData {
  name: string;
  type: VendorTier;
  website_url: string;
  verified: boolean;
  verification_date: any; // Will be Timestamp or null
  created_at: any;
  updated_at: any;
  created_by: string; // Admin user ID, use placeholder for seed
}

interface OfferSeedData {
  vendor_name: string; // Will be resolved to vendor_id
  tier: VendorTier;
  peptide_name: string;
  status: 'active' | 'inactive' | 'discontinued';
  research_pricing?: any;
  telehealth_pricing?: any;
  brand_pricing?: any;
  verification_status: 'unverified' | 'verified' | 'disputed';
  verified_by: string | null;
  verified_at: any;
  last_price_check: any;
  price_source_type: string;
  notes?: string;
  created_at: any;
  updated_at: any;
  submitted_by: string;
}

// ============================================================================
// SEED DATA
// ============================================================================

const ADMIN_USER_ID = 'seed_admin'; // Placeholder, replace with actual admin ID if available

// ----------------------------------------------------------------------------
// TIER 1: RESEARCH PEPTIDE VENDORS (12 vendors)
// ----------------------------------------------------------------------------

const tier1Vendors: VendorSeedData[] = [
  {
    name: 'Peptide Sciences',
    type: 'research',
    website_url: 'https://www.peptidesciences.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Core Peptides',
    type: 'research',
    website_url: 'https://corepeptides.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Amino USA',
    type: 'research',
    website_url: 'https://aminousa.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Direct Peptides',
    type: 'research',
    website_url: 'https://direct-peptides.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Biotech Peptides',
    type: 'research',
    website_url: 'https://biotechpeptides.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Iron Mountain Labz',
    type: 'research',
    website_url: 'https://ironmountainlabz.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Pinnacle Peptides',
    type: 'research',
    website_url: 'https://pinnaclepeptides.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Longevity Peptides',
    type: 'research',
    website_url: 'https://longevitypeptides.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Peptide Pros',
    type: 'research',
    website_url: 'https://peptidepros.net',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Limitless Life Nootropics',
    type: 'research',
    website_url: 'https://limitlesslifenootropics.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'CanLab Research',
    type: 'research',
    website_url: 'https://canlabresearch.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Peptalyon',
    type: 'research',
    website_url: 'https://peptalyon.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
];

// ----------------------------------------------------------------------------
// TIER 2: TELEHEALTH & GLP CLINICS (8 vendors)
// ----------------------------------------------------------------------------

const tier2Vendors: VendorSeedData[] = [
  {
    name: 'Ro',
    type: 'telehealth',
    website_url: 'https://ro.co',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Hims',
    type: 'telehealth',
    website_url: 'https://www.hims.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'WeightWatchers',
    type: 'telehealth',
    website_url: 'https://www.weightwatchers.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Eden',
    type: 'telehealth',
    website_url: 'https://www.tryeden.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'AgelessRx',
    type: 'telehealth',
    website_url: 'https://agelessrx.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'FitRx',
    type: 'telehealth',
    website_url: 'https://www.fitrx.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Fridays Health',
    type: 'telehealth',
    website_url: 'https://www.joinfridays.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Citizen Meds',
    type: 'telehealth',
    website_url: 'https://citizenmeds.com',
    verified: false,
    verification_date: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
];

// ----------------------------------------------------------------------------
// TIER 3: BRAND / ORIGINATOR GLPs (2 manufacturers)
// ----------------------------------------------------------------------------

const tier3Vendors: VendorSeedData[] = [
  {
    name: 'Novo Nordisk',
    type: 'brand',
    website_url: 'https://www.novonordisk.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
  {
    name: 'Eli Lilly',
    type: 'brand',
    website_url: 'https://www.lilly.com',
    verified: true,
    verification_date: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: ADMIN_USER_ID,
  },
];

// ----------------------------------------------------------------------------
// SAMPLE OFFERS (5 per tier = 15 total)
// ----------------------------------------------------------------------------

const tier1SampleOffers: Omit<OfferSeedData, 'vendor_name'>[] = [
  {
    tier: 'research',
    peptide_name: 'BPC-157',
    status: 'active',
    research_pricing: {
      size_mg: 5,
      price_usd: 45.00,
      price_per_mg: 9.00,
      shipping_usd: 12.00,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'Initial seed data for V1 validation',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'research',
    peptide_name: 'BPC-157',
    status: 'active',
    research_pricing: {
      size_mg: 5,
      price_usd: 42.00,
      price_per_mg: 8.40,
      shipping_usd: 10.00,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'research',
    peptide_name: 'Semaglutide',
    status: 'active',
    research_pricing: {
      size_mg: 5,
      price_usd: 85.00,
      price_per_mg: 17.00,
      shipping_usd: 15.00,
    },
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'Unverified for review queue testing',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'research',
    peptide_name: 'Tirzepatide',
    status: 'active',
    research_pricing: {
      size_mg: 10,
      price_usd: 195.00,
      price_per_mg: 19.50,
      shipping_usd: 20.00,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'research',
    peptide_name: 'CJC-1295',
    status: 'active',
    research_pricing: {
      size_mg: 2,
      price_usd: 32.00,
      price_per_mg: 16.00,
      shipping_usd: 10.00,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
];

const tier2SampleOffers: Omit<OfferSeedData, 'vendor_name'>[] = [
  {
    tier: 'telehealth',
    peptide_name: 'Semaglutide',
    status: 'active',
    telehealth_pricing: {
      subscription_price_monthly: 399.00,
      subscription_includes_medication: true,
      medication_dose: '1.0mg per injection',
      consultation_included: true,
      required_fields_transparent: true,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'GLP type: Semaglutide, Injections per month: 4, Total: 4mg/month',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'telehealth',
    peptide_name: 'Semaglutide',
    status: 'active',
    telehealth_pricing: {
      subscription_price_monthly: 199.00,
      subscription_includes_medication: false,
      medication_separate_cost: 70.00,
      medication_dose: '2.5mg per injection',
      consultation_included: true,
      required_fields_transparent: true,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'GLP type: Semaglutide, Injections per month: 4, Total: 10mg/month',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'telehealth',
    peptide_name: 'Semaglutide',
    status: 'active',
    telehealth_pricing: {
      subscription_price_monthly: 299.00,
      subscription_includes_medication: true,
      medication_dose: '2.4mg per injection',
      consultation_included: true,
      required_fields_transparent: true,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'GLP type: Semaglutide, Injections per month: 4, Total: 9.6mg/month',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'telehealth',
    peptide_name: 'Tirzepatide',
    status: 'active',
    telehealth_pricing: {
      subscription_price_monthly: 449.00,
      subscription_includes_medication: true,
      medication_dose: '5mg per injection',
      consultation_included: true,
      required_fields_transparent: true,
    },
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'GLP type: Tirzepatide, Injections per month: 4, Total: 20mg/month - Unverified for review queue testing',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
  {
    tier: 'telehealth',
    peptide_name: 'Tirzepatide',
    status: 'active',
    telehealth_pricing: {
      subscription_price_monthly: 350.00,
      subscription_includes_medication: true,
      medication_dose: '2.5mg per injection',
      consultation_included: true,
      required_fields_transparent: true,
    },
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    price_source_type: 'manual_upload',
    notes: 'GLP type: Tirzepatide, Injections per month: 4, Total: 10mg/month',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    submitted_by: ADMIN_USER_ID,
  },
];

// Tier 3 uses separate tier3_reference_pricing collection
const tier3ReferenceData = [
  {
    product_name: 'Wegovy',
    product_url: 'https://www.wegovy.com',
    glp_type: 'Semaglutide',
    tier: 'brand',
    brand_pricing: {
      dose_strength: '0.25mg',
      price_per_dose: 185.00,
      doses_per_package: 4,
      total_package_price: 740.00,
    },
    pricing_source: 'Manufacturer list price',
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    notes: 'Starter dose, first month',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    updated_by: ADMIN_USER_ID,
  },
  {
    product_name: 'Ozempic',
    product_url: 'https://www.ozempic.com',
    glp_type: 'Semaglutide',
    tier: 'brand',
    brand_pricing: {
      dose_strength: '0.5mg',
      price_per_dose: 225.00,
      doses_per_package: 4,
      total_package_price: 900.00,
    },
    pricing_source: 'Manufacturer list price',
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    notes: 'Maintenance dose',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    updated_by: ADMIN_USER_ID,
  },
  {
    product_name: 'Zepbound',
    product_url: 'https://www.zepbound.lilly.com',
    glp_type: 'Tirzepatide',
    tier: 'brand',
    brand_pricing: {
      dose_strength: '2.5mg',
      price_per_dose: 275.00,
      doses_per_package: 4,
      total_package_price: 1100.00,
    },
    pricing_source: 'Manufacturer list price',
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    notes: 'Starter dose',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    updated_by: ADMIN_USER_ID,
  },
  {
    product_name: 'Mounjaro',
    product_url: 'https://www.mounjaro.com',
    glp_type: 'Tirzepatide',
    tier: 'brand',
    brand_pricing: {
      dose_strength: '5mg',
      price_per_dose: 300.00,
      doses_per_package: 4,
      total_package_price: 1200.00,
    },
    pricing_source: 'Manufacturer list price',
    verification_status: 'verified',
    verified_by: ADMIN_USER_ID,
    verified_at: serverTimestamp(),
    last_price_check: serverTimestamp(),
    notes: 'Maintenance dose',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    updated_by: ADMIN_USER_ID,
  },
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedVendors(): Promise<Map<string, string>> {
  console.log('🌱 Seeding vendors...');
  const vendorIdMap = new Map<string, string>();
  
  const allVendors = [...tier1Vendors, ...tier2Vendors, ...tier3Vendors];
  
  for (const vendor of allVendors) {
    try {
      // Check if vendor already exists
      const vendorsRef = collection(db, 'vendors');
      const q = query(vendorsRef, where('name', '==', vendor.name));
      const existingDocs = await getDocs(q);
      
      if (!existingDocs.empty) {
        const existingId = existingDocs.docs[0].id;
        vendorIdMap.set(vendor.name, existingId);
        console.log(`  ✓ Vendor "${vendor.name}" already exists (ID: ${existingId})`);
        continue;
      }
      
      // Create new vendor
      const docRef = await addDoc(collection(db, 'vendors'), vendor);
      vendorIdMap.set(vendor.name, docRef.id);
      console.log(`  ✓ Created vendor: ${vendor.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`  ✗ Error creating vendor "${vendor.name}":`, error);
    }
  }
  
  console.log(`✅ Seeded ${vendorIdMap.size} vendors\n`);
  return vendorIdMap;
}

async function seedOffers(vendorIdMap: Map<string, string>): Promise<void> {
  console.log('🌱 Seeding vendor offers...');
  
  // Tier 1 offers
  const tier1VendorNames = ['Peptide Sciences', 'Core Peptides', 'Amino USA', 'Direct Peptides', 'Biotech Peptides'];
  for (let i = 0; i < tier1SampleOffers.length; i++) {
    const vendorName = tier1VendorNames[i];
    const vendorId = vendorIdMap.get(vendorName);
    
    if (!vendorId) {
      console.error(`  ✗ Vendor "${vendorName}" not found in map`);
      continue;
    }
    
    const offerData = {
      ...tier1SampleOffers[i],
      vendor_id: vendorId,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'vendor_offers'), offerData);
      console.log(`  ✓ Created Tier 1 offer: ${offerData.peptide_name} from ${vendorName} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`  ✗ Error creating Tier 1 offer for ${vendorName}:`, error);
    }
  }
  
  // Tier 2 offers
  const tier2VendorNames = ['Ro', 'Hims', 'WeightWatchers', 'Eden', 'AgelessRx'];
  for (let i = 0; i < tier2SampleOffers.length; i++) {
    const vendorName = tier2VendorNames[i];
    const vendorId = vendorIdMap.get(vendorName);
    
    if (!vendorId) {
      console.error(`  ✗ Vendor "${vendorName}" not found in map`);
      continue;
    }
    
    const offerData = {
      ...tier2SampleOffers[i],
      vendor_id: vendorId,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'vendor_offers'), offerData);
      console.log(`  ✓ Created Tier 2 offer: ${offerData.peptide_name} from ${vendorName} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`  ✗ Error creating Tier 2 offer for ${vendorName}:`, error);
    }
  }
  
  console.log(`✅ Seeded vendor offers\n`);
}

async function seedTier3Reference(vendorIdMap: Map<string, string>): Promise<void> {
  console.log('🌱 Seeding Tier 3 reference pricing...');
  
  const vendorMapping = {
    'Wegovy': 'Novo Nordisk',
    'Ozempic': 'Novo Nordisk',
    'Zepbound': 'Eli Lilly',
    'Mounjaro': 'Eli Lilly',
  };
  
  for (const refData of tier3ReferenceData) {
    const vendorName = vendorMapping[refData.product_name as keyof typeof vendorMapping];
    const vendorId = vendorIdMap.get(vendorName);
    
    if (!vendorId) {
      console.error(`  ✗ Vendor "${vendorName}" not found in map`);
      continue;
    }
    
    const pricingData = {
      ...refData,
      vendor_id: vendorId,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'tier3_reference_pricing'), pricingData);
      console.log(`  ✓ Created Tier 3 reference: ${refData.product_name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`  ✗ Error creating Tier 3 reference for ${refData.product_name}:`, error);
    }
  }
  
  console.log(`✅ Seeded Tier 3 reference pricing\n`);
}

async function main() {
  console.log('🚀 Starting Vendor Comparison V1 seed script...\n');
  
  try {
    // Step 1: Seed vendors
    const vendorIdMap = await seedVendors();
    
    // Step 2: Seed vendor offers
    await seedOffers(vendorIdMap);
    
    // Step 3: Seed Tier 3 reference pricing
    await seedTier3Reference(vendorIdMap);
    
    console.log('✅ Seed script completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${tier1Vendors.length} Tier 1 vendors (Research Peptides)`);
    console.log(`  - ${tier2Vendors.length} Tier 2 vendors (Telehealth & GLP Clinics)`);
    console.log(`  - ${tier3Vendors.length} Tier 3 vendors (Brand / Originator GLPs)`);
    console.log(`  - ${tier1SampleOffers.length} Tier 1 sample offers`);
    console.log(`  - ${tier2SampleOffers.length} Tier 2 sample offers`);
    console.log(`  - ${tier3ReferenceData.length} Tier 3 reference pricing entries`);
    console.log(`  - Total: ${vendorIdMap.size} vendors, ${tier1SampleOffers.length + tier2SampleOffers.length} offers, ${tier3ReferenceData.length} references`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

