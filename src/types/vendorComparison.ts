/**
 * Vendor Comparison V1 - Type Definitions
 * 
 * This file contains all TypeScript interfaces for the Vendor Comparison feature.
 * Follows the locked specification in Vendor_Comparison_V1.md
 * 
 * Collections:
 * - vendors: Master vendor directory
 * - vendor_offers: Tier-specific pricing offers
 * - tier3_reference_pricing: Admin-editable brand GLP reference
 * - vendor_price_uploads: Upload tracking and processing
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type VendorTier = 'research' | 'telehealth' | 'brand';
export type VerificationStatus = 'unverified' | 'verified' | 'disputed';
export type OfferStatus = 'active' | 'inactive' | 'discontinued';
export type UploadType = 'csv' | 'excel' | 'pdf';
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PriceSourceType = 
  | 'manual_upload' 
  | 'csv_import' 
  | 'pdf_upload'
  | 'automated_scrape'; // V2+ only, not used in V1

export type GLPType = 'Semaglutide' | 'Tirzepatide';

// ============================================================================
// VENDOR COLLECTION
// ============================================================================

export interface VendorMetadata {
  shipping_countries?: string[];
  accepts_crypto?: boolean;
  lab_tested?: boolean;
  subscription_required?: boolean;
  originator_brand?: boolean;
  // Extensible: admin can add custom fields
  [key: string]: any;
}

export interface Vendor {
  id: string;
  name: string;
  type: VendorTier;
  website_url: string;
  verified: boolean;
  verification_date: Timestamp | null;
  
  // Optional metadata (not required for comparison logic)
  metadata?: VendorMetadata;
  
  // Audit fields
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface VendorFormData {
  name: string;
  type: VendorTier;
  website_url: string;
  verified: boolean;
  metadata?: VendorMetadata;
}

// ============================================================================
// TIER-SPECIFIC PRICING STRUCTURES
// ============================================================================

/**
 * Tier 1: Research Peptide Vendors
 * - Direct price comparison by $/mg
 * - No subscriptions
 */
export interface ResearchPricing {
  size_mg: number;
  price_usd: number;
  price_per_mg: number; // Calculated: price_usd / size_mg
  shipping_usd: number;
  lab_test_url?: string;
}

/**
 * Tier 2: Telehealth & GLP Clinics
 * - Subscription-first pricing
 * - Medication cost ONLY shown if not included
 * - NO inferred pricing
 * - REQUIRED transparency fields per LOCKED SPEC
 */
export interface TelehealthPricing {
  subscription_price_monthly: number;
  subscription_includes_medication: boolean;
  medication_separate_cost?: number; // ONLY if medication not included
  consultation_included: boolean;
  required_fields_transparent: boolean; // Must be true
  
  // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
  glp_type: GLPType; // Semaglutide or Tirzepatide
  dose_mg_per_injection: number;
  injections_per_month: number;
  total_mg_per_month: number; // Calculated: dose_mg_per_injection * injections_per_month
  
  // DEPRECATED: Use structured fields above instead
  medication_dose?: string; // Legacy field, use dose_mg_per_injection instead
}

/**
 * Tier 3: Brand / Originator GLPs
 * - Medication-only pricing (no subscriptions)
 * - Dose-level transparency
 */
export interface BrandPricing {
  dose_strength: string; // e.g., "0.25mg", "0.5mg"
  price_per_dose: number;
  doses_per_package: number;
  total_package_price: number;
}

// ============================================================================
// VENDOR OFFERS COLLECTION
// ============================================================================

export interface VendorOffer {
  id: string;
  vendor_id: string; // Reference to vendors collection
  tier: VendorTier;
  peptide_name: string;
  status: OfferStatus;
  
  // Tier-specific pricing (only one populated based on tier)
  research_pricing?: ResearchPricing;
  telehealth_pricing?: TelehealthPricing;
  brand_pricing?: BrandPricing;
  
  // Verification
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: Timestamp | null;
  last_price_check: Timestamp;
  
  // Source tracking
  price_source_type: PriceSourceType;
  source_document_url?: string; // For PDF uploads
  product_url?: string; // Direct link to the specific product page
  
  // Upload batch tracking (for upsert & history)
  upload_batch_id?: string; // Link to vendor_price_uploads.id
  last_upload_batch_id?: string; // Track most recent update
  
  // Optional fields
  discount_code?: string;
  notes?: string;
  
  // Audit fields
  created_at: Timestamp;
  updated_at: Timestamp;
  submitted_by: string;
}

export interface VendorOfferFormData {
  vendor_id: string;
  tier: VendorTier;
  peptide_name: string;
  status: OfferStatus;
  
  // Tier-specific pricing data
  research_pricing?: Partial<ResearchPricing>;
  telehealth_pricing?: Partial<TelehealthPricing>;
  brand_pricing?: Partial<BrandPricing>;
  
  product_url?: string;
  discount_code?: string;
  notes?: string;
}

// ============================================================================
// VENDOR OFFER PRICE HISTORY COLLECTION
// ============================================================================

/**
 * Price history tracking for vendor offers
 * Records price changes when CSV imports update existing offers
 */
export interface VendorOfferPriceHistory {
  id: string;
  offer_id: string; // Reference to vendor_offer
  vendor_id: string;
  tier: VendorTier;
  peptide_name: string;
  
  // Old pricing snapshot
  old_research_pricing?: ResearchPricing;
  old_telehealth_pricing?: TelehealthPricing;
  old_brand_pricing?: BrandPricing;
  
  // New pricing
  new_research_pricing?: ResearchPricing;
  new_telehealth_pricing?: TelehealthPricing;
  new_brand_pricing?: BrandPricing;
  
  // Change tracking
  price_change_pct?: number; // Calculated percentage change
  changed_fields: string[]; // e.g., ['price_usd', 'size_mg']
  
  // Source
  upload_batch_id: string; // Link to vendor_price_uploads
  changed_by: string;
  changed_at: Timestamp;
}

// Populated offer with vendor data for display
export interface VendorOfferWithVendor extends VendorOffer {
  vendor: Vendor;
}

// ============================================================================
// TIER 3 REFERENCE PRICING COLLECTION
// ============================================================================

export interface Tier3ReferencePricing {
  id: string;
  vendor_id: string; // Reference to brand vendors (Novo Nordisk, Eli Lilly)
  product_name: string; // "Wegovy", "Ozempic", "Zepbound", "Mounjaro"
  product_url?: string;
  glp_type: GLPType;
  tier: 'brand'; // Always brand
  
  brand_pricing: BrandPricing;
  
  pricing_source: string; // e.g., "Manufacturer list price", "GoodRx cash price"
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: Timestamp | null;
  last_price_check: Timestamp;
  
  notes?: string;
  
  // Audit fields
  created_at: Timestamp;
  updated_at: Timestamp;
  updated_by: string;
}

export interface Tier3ReferencePricingFormData {
  vendor_id: string;
  product_name: string;
  product_url?: string;
  glp_type: GLPType;
  brand_pricing: Partial<BrandPricing>;
  pricing_source: string;
  notes?: string;
}

// ============================================================================
// CSV/UPLOAD PROCESSING
// ============================================================================

export interface ParsedRow {
  row_number: number;
  data: Record<string, any>;
  validation_errors: string[];
  is_valid: boolean;
}

export interface PdfMapping {
  vendor_id: string;
  tier: VendorTier;
  manual_entries: VendorOfferFormData[];
}

export interface VendorPriceUpload {
  id: string;
  upload_type: UploadType;
  file_url: string; // Firebase Storage path
  file_name: string;
  status: UploadStatus;
  tier: VendorTier; // Which tier template was used
  
  // For CSV/Excel - automatic parsing
  parsed_rows?: ParsedRow[];
  
  // For PDF - manual mapping
  pdf_mapping?: PdfMapping;
  
  // Processing results
  total_rows: number;
  success_count: number;
  error_count: number;
  errors?: string[];
  ignored_columns?: string[]; // Extra columns that were ignored
  
  // Audit
  uploaded_by: string;
  uploaded_at: Timestamp;
  processed_at?: Timestamp;
  processed_by?: string;
}

// ============================================================================
// CSV PARSING & VALIDATION
// ============================================================================

export interface CSVHeaderAlias {
  standard_field: string;
  aliases: string[];
}

export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url';
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface CSVParseResult {
  success_rows: ParsedRow[];
  error_rows: ParsedRow[];
  ignored_columns: string[];
  total_rows: number;
  success_count: number;
  error_count: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// COMPARISON & FILTERING
// ============================================================================

export type SortOption = 
  | 'price_per_mg_asc' 
  | 'price_per_mg_desc' 
  | 'subscription_asc' 
  | 'subscription_desc'
  | 'price_per_dose_asc'
  | 'price_per_dose_desc'
  | 'alphabetical';

export interface ComparisonFilters {
  tier: VendorTier;
  peptide_name?: string;
  glp_type?: GLPType;
  vendor_id?: string;
  verified_only?: boolean;
  sort_by?: SortOption;
}

export interface TierConfig {
  sortOptions: SortOption[];
  defaultSort: SortOption;
  comparisonMetric: string;
  allowInference: false; // Always false per spec
}

// ============================================================================
// STATS & DASHBOARD
// ============================================================================

export interface VendorComparisonStats {
  total_vendors: number;
  total_offers: number;
  verified_offers: number;
  unverified_offers: number;
  disputed_offers: number;
  by_tier: {
    research: number;
    telehealth: number;
    brand: number;
  };
  last_update: Timestamp;
}

// ============================================================================
// AUTOMATION (V2+ Extensions)
// ============================================================================

/**
 * V2+ Only: Scraper configuration
 * Not implemented in V1, but structure defined for future extension
 */
export interface VendorScraperConfig {
  vendor_id: string;
  enabled: boolean; // V1: Always false
  scraper_id: string;
  schedule: 'daily' | 'weekly' | 'manual';
  last_run?: Timestamp;
  next_run?: Timestamp;
}

/**
 * V2+ Only: Automation job tracking
 * V1: Only used for timestamp updates
 */
export interface VendorAutomationJob {
  id: string;
  job_type: 'daily_price_check' | 'vendor_scrape' | 'csv_import';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  vendor_id?: string; // If vendor-specific
  started_at: Timestamp;
  completed_at?: Timestamp;
  results: {
    offers_checked: number;
    offers_updated: number;
    errors: string[];
  };
}

