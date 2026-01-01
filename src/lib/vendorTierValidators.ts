/**
 * Vendor Comparison V1 - Tier Validation Logic
 * 
 * This file contains tier-specific validation rules and pricing logic.
 * Enforces the locked specification: no cross-tier math, no inferred pricing.
 * 
 * Key Principles:
 * - Each tier has isolated validation rules
 * - Required fields are strictly enforced
 * - Optional fields are lenient
 * - Cross-tier comparisons are prevented
 * - No inferred or averaged pricing allowed
 */

import {
  VendorTier,
  ResearchPricing,
  TelehealthPricing,
  BrandPricing,
  ValidationResult,
  ValidationRule,
  GLPType,
} from '@/types/vendorComparison';

// ============================================================================
// CONSTANTS
// ============================================================================

export const VENDOR_TIERS = {
  RESEARCH: 'research' as VendorTier,
  TELEHEALTH: 'telehealth' as VendorTier,
  BRAND: 'brand' as VendorTier,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize vendor name for flexible matching
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces into single space
 * 
 * This ensures "Peptide Sciences  " matches "peptide sciences"
 */
export function normalizeVendorName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

export const TIER_CONFIG = {
  research: {
    sortOptions: ['price_per_mg_asc', 'price_per_mg_desc', 'alphabetical'],
    defaultSort: 'price_per_mg_asc',
    comparisonMetric: 'price_per_mg',
    allowInference: false,
  },
  telehealth: {
    sortOptions: ['subscription_asc', 'subscription_desc', 'alphabetical'],
    defaultSort: 'subscription_asc',
    comparisonMetric: 'subscription_price_monthly',
    allowInference: false,
    requireTransparency: true,
  },
  brand: {
    sortOptions: ['price_per_dose_asc', 'price_per_dose_desc', 'alphabetical'],
    defaultSort: 'price_per_dose_asc',
    comparisonMetric: 'price_per_dose',
    allowInference: false,
    referencePriceEditable: true,
  },
} as const;

// ============================================================================
// CSV HEADER ALIASES (Machine-Generated CSV Support)
// ============================================================================

/**
 * Support multiple header variations for flexible CSV parsing
 * Case-insensitive matching handled by parser
 */
export const CSV_HEADER_ALIASES: Record<string, string[]> = {
  // Common fields
  vendor_name: ['vendor_name', 'vendor', 'supplier', 'vendor name', 'source', 'company'],
  peptide_name: ['peptide_name', 'peptide', 'peptide name', 'compound', 'product', 'medication'],
  vendor_url: ['vendor_url', 'vendor_website', 'website', 'vendor_website_url', 'company_url', 'company_website'],
  product_url: ['product_url', 'product_link', 'product_page', 'item_url', 'product_page_url', 'listing_url'],
  
  // Tier 1 (Research)
  size_mg: ['size_mg', 'size', 'mg', 'amount', 'quantity_mg', 'vial_size'],
  price_usd: ['price_usd', 'price', 'cost', 'price (usd)', 'amount_usd', 'vial_price'],
  shipping_usd: ['shipping_usd', 'shipping', 'shipping_cost', 'delivery_cost', 'shipping (usd)'],
  lab_test_url: ['lab_test_url', 'lab_test', 'test_url', 'coa_url', 'certificate'],
  pricing_source_url: ['pricing_source_url', 'pricing_source', 'source_url', 'link'],
  
  // Tier 2 (Telehealth)
  subscription_price_monthly: ['subscription_price_monthly', 'subscription', 'monthly_price', 'subscription_monthly', 'price_per_month', 'monthly_subscription'],
  subscription_includes_medication: ['subscription_includes_medication', 'medication_included', 'includes_medication', 'med_included', 'medication_bundled'],
  medication_separate_cost: ['medication_separate_cost', 'medication_cost', 'med_cost', 'medication_price', 'injection_cost'],
  consultation_included: ['consultation_included', 'consultation', 'consult_included', 'includes_consultation'],
  // REQUIRED TRANSPARENCY FIELDS
  glp_type: ['glp_type', 'glp', 'type', 'medication_type', 'compound_type', 'peptide_type'],
  dose_mg_per_injection: ['dose_mg_per_injection', 'dose_per_injection', 'injection_dose_mg', 'dose_mg', 'mg_per_injection'],
  injections_per_month: ['injections_per_month', 'injections_monthly', 'monthly_injections', 'doses_per_month', 'injections/month'],
  total_mg_per_month: ['total_mg_per_month', 'monthly_mg', 'total_monthly_mg', 'mg_per_month', 'mg/month'],
  // DEPRECATED
  medication_dose: ['medication_dose', 'dose', 'dosage'],
  
  // Tier 3 (Brand)
  brand_name: ['brand_name', 'brand', 'manufacturer', 'company'],
  dose_strength: ['dose_strength', 'dose', 'strength', 'dosage', 'mg_per_dose'],
  price_per_dose: ['price_per_dose', 'dose_price', 'cost_per_dose', 'injection_price', 'price_per_injection'],
  doses_per_package: ['doses_per_package', 'doses', 'doses_per_pack', 'injections_per_pack', 'count'],
  total_package_price: ['total_package_price', 'package_price', 'total_price', 'pack_price'],
  
  // Optional fields
  discount_code: ['discount_code', 'discount', 'promo_code', 'coupon', 'code'],
  notes: ['notes', 'note', 'comments', 'description', 'details'],
  glp_type: ['glp_type', 'glp', 'type', 'medication_type', 'compound_type'],
};

/**
 * Normalize header string for matching
 */
export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Find matching field from aliases
 */
export function mapHeaderToField(header: string): string | null {
  const normalized = normalizeHeader(header);
  
  for (const [field, aliases] of Object.entries(CSV_HEADER_ALIASES)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    if (normalizedAliases.includes(normalized)) {
      return field;
    }
  }
  
  return null; // Unknown column, will be ignored
}

// ============================================================================
// TIER 1: RESEARCH PEPTIDE VALIDATORS
// ============================================================================

export const TIER1_VALIDATION_RULES: ValidationRule[] = [
  { field: 'vendor_name', required: true, type: 'string' },
  { field: 'peptide_name', required: true, type: 'string' },
  { field: 'size_mg', required: true, type: 'number', min: 0.01 },
  { field: 'price_usd', required: true, type: 'number', min: 0.01 },
  { field: 'shipping_usd', required: false, type: 'number', min: 0 },
  { field: 'lab_test_url', required: false, type: 'url' },
];

export function validateTier1Pricing(data: Partial<ResearchPricing>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!data.size_mg || data.size_mg <= 0) {
    errors.push('size_mg must be a positive number');
  }
  
  if (!data.price_usd || data.price_usd <= 0) {
    errors.push('price_usd must be a positive number');
  }
  
  if (data.shipping_usd !== undefined && data.shipping_usd < 0) {
    errors.push('shipping_usd cannot be negative');
  }
  
  // Validate calculated price_per_mg if provided
  if (data.size_mg && data.price_usd && data.price_per_mg !== undefined) {
    const calculated = data.price_usd / data.size_mg;
    const difference = Math.abs(calculated - data.price_per_mg);
    
    if (difference > 0.01) {
      errors.push(`price_per_mg (${data.price_per_mg}) doesn't match calculated value (${calculated.toFixed(2)})`);
    }
  }
  
  // URL validation
  if (data.lab_test_url && !isValidUrl(data.lab_test_url)) {
    errors.push('lab_test_url must be a valid URL');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate $/mg for Tier 1
 * This is the ONLY allowed calculation for research peptides
 */
export function calculateResearchPricePerMg(price_usd: number, size_mg: number): number {
  if (size_mg <= 0) {
    throw new Error('size_mg must be positive');
  }
  return parseFloat((price_usd / size_mg).toFixed(2));
}

// ============================================================================
// TIER 2: TELEHEALTH VALIDATORS
// ============================================================================

export const TIER2_VALIDATION_RULES: ValidationRule[] = [
  { field: 'vendor_name', required: true, type: 'string' },
  { field: 'peptide_name', required: true, type: 'string' },
  { field: 'subscription_price_monthly', required: true, type: 'number', min: 0.01 },
  { field: 'subscription_includes_medication', required: true, type: 'boolean' },
  { field: 'glp_type', required: true, type: 'string' },
  { field: 'dose_mg_per_injection', required: true, type: 'number', min: 0.01 },
  { field: 'injections_per_month', required: true, type: 'number', min: 1 },
  { field: 'total_mg_per_month', required: true, type: 'number', min: 0.01 },
  { field: 'consultation_included', required: false, type: 'boolean' },
  // DEPRECATED: medication_dose is legacy field
  { field: 'medication_dose', required: false, type: 'string' },
];

export function validateTier2Pricing(data: Partial<TelehealthPricing>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!data.subscription_price_monthly || data.subscription_price_monthly <= 0) {
    errors.push('subscription_price_monthly must be a positive number');
  }
  
  if (data.subscription_includes_medication === undefined || data.subscription_includes_medication === null) {
    errors.push('subscription_includes_medication is required (true/false)');
  }
  
  // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
  if (!data.glp_type) {
    errors.push('glp_type is required (Semaglutide or Tirzepatide)');
  }
  
  if (!data.dose_mg_per_injection || data.dose_mg_per_injection <= 0) {
    errors.push('dose_mg_per_injection must be a positive number');
  }
  
  if (!data.injections_per_month || data.injections_per_month < 1) {
    errors.push('injections_per_month must be at least 1');
  }
  
  if (!data.total_mg_per_month || data.total_mg_per_month <= 0) {
    errors.push('total_mg_per_month must be a positive number');
  }
  
  // Validate calculated total_mg_per_month if all fields present
  if (data.dose_mg_per_injection && data.injections_per_month && data.total_mg_per_month) {
    const calculated = data.dose_mg_per_injection * data.injections_per_month;
    const difference = Math.abs(calculated - data.total_mg_per_month);
    
    if (difference > 0.01) {
      errors.push(`total_mg_per_month (${data.total_mg_per_month}) doesn't match calculated value (${calculated.toFixed(2)})`);
    }
  }
  
  // CRITICAL RULE: If medication not included, separate cost MUST be provided
  if (data.subscription_includes_medication === false) {
    if (!data.medication_separate_cost || data.medication_separate_cost <= 0) {
      errors.push('medication_separate_cost is required when medication is not included in subscription');
    }
  }
  
  // CRITICAL RULE: If medication included, separate cost MUST NOT be provided
  if (data.subscription_includes_medication === true && data.medication_separate_cost !== undefined && data.medication_separate_cost !== null) {
    errors.push('medication_separate_cost should not be provided when medication is included in subscription');
  }
  
  // Transparency requirement
  if (data.required_fields_transparent !== undefined && !data.required_fields_transparent) {
    errors.push('required_fields_transparent must be true (all transparency fields must be provided)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total mg per month for Tier 2
 * This is the ONLY allowed calculation for telehealth transparency
 */
export function calculateTelehealthTotalMg(dose_mg_per_injection: number, injections_per_month: number): number {
  if (dose_mg_per_injection <= 0) {
    throw new Error('dose_mg_per_injection must be positive');
  }
  if (injections_per_month < 1) {
    throw new Error('injections_per_month must be at least 1');
  }
  return parseFloat((dose_mg_per_injection * injections_per_month).toFixed(2));
}

/**
 * PROHIBITED: No cost-per-dose calculation for Tier 2
 * Subscription price MUST NOT be divided to infer injection cost
 */
export function canCalculateTier2CostPerDose(): false {
  return false; // Always false per spec
}

// ============================================================================
// TIER 3: BRAND GLP VALIDATORS
// ============================================================================

export const TIER3_VALIDATION_RULES: ValidationRule[] = [
  { field: 'brand_name', required: true, type: 'string' },
  { field: 'peptide_name', required: true, type: 'string' },
  { field: 'dose_strength', required: true, type: 'string' },
  { field: 'price_per_dose', required: true, type: 'number', min: 0.01 },
  { field: 'doses_per_package', required: true, type: 'number', min: 1 },
];

export function validateTier3Pricing(data: Partial<BrandPricing>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!data.dose_strength || data.dose_strength.trim() === '') {
    errors.push('dose_strength is required (e.g., "0.25mg", "0.5mg")');
  }
  
  if (!data.price_per_dose || data.price_per_dose <= 0) {
    errors.push('price_per_dose must be a positive number');
  }
  
  if (!data.doses_per_package || data.doses_per_package < 1) {
    errors.push('doses_per_package must be at least 1');
  }
  
  // Validate calculated total_package_price if provided
  if (data.price_per_dose && data.doses_per_package && data.total_package_price !== undefined) {
    const calculated = data.price_per_dose * data.doses_per_package;
    const difference = Math.abs(calculated - data.total_package_price);
    
    if (difference > 0.01) {
      errors.push(`total_package_price (${data.total_package_price}) doesn't match calculated value (${calculated.toFixed(2)})`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total package price for Tier 3
 * This is the ONLY allowed calculation for brand GLPs
 */
export function calculateBrandTotalPrice(price_per_dose: number, doses_per_package: number): number {
  if (doses_per_package < 1) {
    throw new Error('doses_per_package must be at least 1');
  }
  return parseFloat((price_per_dose * doses_per_package).toFixed(2));
}

// ============================================================================
// CROSS-TIER VALIDATION
// ============================================================================

/**
 * CRITICAL: Prevent cross-tier comparisons
 * Tiers MUST remain isolated per spec
 */
export function canCompareTiers(tier1: VendorTier, tier2: VendorTier): boolean {
  return tier1 === tier2; // Only same tier can be compared
}

/**
 * Validate that offer data matches its tier
 */
export function validateOfferMatchesTier(
  tier: VendorTier,
  research_pricing?: Partial<ResearchPricing>,
  telehealth_pricing?: Partial<TelehealthPricing>,
  brand_pricing?: Partial<BrandPricing>
): ValidationResult {
  const errors: string[] = [];
  
  // Check that only the correct pricing type is provided
  if (tier === 'research') {
    if (!research_pricing) {
      errors.push('research_pricing is required for research tier');
    }
    if (telehealth_pricing) {
      errors.push('telehealth_pricing should not be provided for research tier');
    }
    if (brand_pricing) {
      errors.push('brand_pricing should not be provided for research tier');
    }
  }
  
  if (tier === 'telehealth') {
    if (research_pricing) {
      errors.push('research_pricing should not be provided for telehealth tier');
    }
    if (!telehealth_pricing) {
      errors.push('telehealth_pricing is required for telehealth tier');
    }
    if (brand_pricing) {
      errors.push('brand_pricing should not be provided for telehealth tier');
    }
  }
  
  if (tier === 'brand') {
    if (research_pricing) {
      errors.push('research_pricing should not be provided for brand tier');
    }
    if (telehealth_pricing) {
      errors.push('telehealth_pricing should not be provided for brand tier');
    }
    if (!brand_pricing) {
      errors.push('brand_pricing is required for brand tier');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// GENERIC VALIDATORS
// ============================================================================

export function validateRow(row: any, rules: ValidationRule[]): string[] {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const value = row[rule.field];
    
    // Required check
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    
    // Skip further validation if field is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      continue;
    }
    
    // Type check
    if (rule.type === 'number' && typeof value !== 'number') {
      errors.push(`${rule.field} must be a number`);
      continue;
    }
    
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${rule.field} must be a string`);
      continue;
    }
    
    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${rule.field} must be true or false`);
      continue;
    }
    
    if (rule.type === 'url' && typeof value === 'string' && !isValidUrl(value)) {
      errors.push(`${rule.field} must be a valid URL`);
      continue;
    }
    
    // Range check for numbers
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${rule.field} must be >= ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${rule.field} must be <= ${rule.max}`);
      }
    }
    
    // Pattern check for strings
    if (rule.type === 'string' && typeof value === 'string' && rule.pattern) {
      if (!rule.pattern.test(value)) {
        errors.push(`${rule.field} format is invalid`);
      }
    }
  }
  
  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse boolean value from various string representations
 * Handles machine-generated CSV variations
 */
export function parseBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y', '1', 'included', 'inc'].includes(normalized)) {
      return true;
    }
    if (['false', 'no', 'n', '0', 'not included', 'separate'].includes(normalized)) {
      return false;
    }
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return null;
}

// ============================================================================
// GLP TYPE VALIDATION
// ============================================================================

const VALID_GLP_TYPES: GLPType[] = ['Semaglutide', 'Tirzepatide'];

export function isValidGLPType(glp_type: string): glp_type is GLPType {
  return VALID_GLP_TYPES.includes(glp_type as GLPType);
}

export function normalizeGLPType(value: string): GLPType | null {
  const normalized = value.trim().toLowerCase();
  
  if (normalized.includes('sema')) {
    return 'Semaglutide';
  }
  if (normalized.includes('tirze')) {
    return 'Tirzepatide';
  }
  
  return null;
}

