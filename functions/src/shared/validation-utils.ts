/**
 * Shared Validation Utilities
 * 
 * Pure Node.js validation logic extracted from vendorTierValidators.ts
 * Used by:
 * - CSV parser (frontend)
 * - Scrapers (Cloud Functions)
 * 
 * Key Principles:
 * - Tier-isolated validation
 * - No cross-tier math
 * - No inferred pricing
 */

export type VendorTier = 'research' | 'telehealth' | 'brand';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ResearchPricing {
  size_mg: number;
  price_usd: number;
  shipping_usd?: number;
  price_per_mg: number;
}

export interface TelehealthPricing {
  subscription_price_monthly: number;
  medication_cost_usd?: number;
  glp_type: 'glp1' | 'glp1_glp2';
  dose_mg_per_injection?: number;
}

export interface BrandPricing {
  dose_strength: string;
  doses_per_package: number;
  price_per_dose: number;
  total_package_price?: number;
}

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
 */
export function normalizeVendorName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalize peptide name
 */
export function normalizePeptideName(name: string): string {
  return name.trim();
}

/**
 * Calculate research price per mg
 */
export function calculateResearchPricePerMg(
  priceUsd: number,
  sizeMg: number,
  shippingUsd?: number
): number {
  const totalPrice = priceUsd + (shippingUsd || 0);
  const pricePerMg = totalPrice / sizeMg;
  return Math.round(pricePerMg * 100) / 100; // 2 decimal places
}

// ============================================================================
// TIER-1 (RESEARCH) VALIDATION
// ============================================================================

export const TIER1_VALIDATION_RULES = {
  vendor_name: { required: true },
  peptide_name: { required: true },
  vendor_url: { required: false },
  product_url: { required: false },
  size_mg: { required: true, type: 'number', min: 0 },
  price_usd: { required: true, type: 'number', min: 0 },
  shipping_usd: { required: false, type: 'number', min: 0 },
  lab_test_url: { required: false },
  pricing_source: { required: false },
} as const;

/**
 * Validate Tier-1 (Research) offer
 */
export function validateTier1Offer(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.vendor_name) errors.push('vendor_name is required');
  if (!data.peptide_name) errors.push('peptide_name is required');

  // Required pricing fields
  if (data.size_mg === undefined || data.size_mg === null) {
    errors.push('size_mg is required');
  } else if (typeof data.size_mg !== 'number' || data.size_mg <= 0) {
    errors.push('size_mg must be a positive number');
  }

  if (data.price_usd === undefined || data.price_usd === null) {
    errors.push('price_usd is required');
  } else if (typeof data.price_usd !== 'number' || data.price_usd < 0) {
    errors.push('price_usd must be a non-negative number');
  }

  // Optional but validated if present
  if (data.shipping_usd !== undefined && data.shipping_usd !== null) {
    if (typeof data.shipping_usd !== 'number' || data.shipping_usd < 0) {
      errors.push('shipping_usd must be a non-negative number');
    }
  }

  // Warnings for missing optional fields
  if (!data.product_url) warnings.push('product_url is missing (recommended)');
  if (!data.vendor_url) warnings.push('vendor_url is missing (recommended)');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Build Tier-1 research pricing object
 * Handles undefined values by returning null for invalid pricing
 */
export function buildResearchPricing(data: any): ResearchPricing | null {
  // Validate required fields exist
  if (data.size_mg === undefined || data.size_mg === null || data.size_mg <= 0) {
    console.warn('[buildResearchPricing] Invalid size_mg:', data.size_mg);
    return null;
  }
  
  if (data.price_usd === undefined || data.price_usd === null || data.price_usd <= 0) {
    console.warn('[buildResearchPricing] Invalid price_usd:', data.price_usd);
    return null;
  }

  const pricePerMg = calculateResearchPricePerMg(
    data.price_usd,
    data.size_mg,
    data.shipping_usd
  );

  return {
    size_mg: data.size_mg,
    price_usd: data.price_usd,
    shipping_usd: data.shipping_usd || 0,
    price_per_mg: pricePerMg,
  };
}

// ============================================================================
// TIER-2 (TELEHEALTH) VALIDATION
// ============================================================================

export const TIER2_VALIDATION_RULES = {
  vendor_name: { required: true },
  peptide_name: { required: true },
  vendor_url: { required: false },
  product_url: { required: false },
  subscription_price_monthly: { required: true, type: 'number', min: 0 },
  medication_cost_usd: { required: false, type: 'number', min: 0 },
  glp_type: { required: true, enum: ['glp1', 'glp1_glp2'] },
  dose_mg_per_injection: { required: false, type: 'number', min: 0 },
} as const;

/**
 * Validate Tier-2 (Telehealth) offer
 */
export function validateTier2Offer(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.vendor_name) errors.push('vendor_name is required');
  if (!data.peptide_name) errors.push('peptide_name is required');

  // Required pricing fields
  if (data.subscription_price_monthly === undefined || data.subscription_price_monthly === null) {
    errors.push('subscription_price_monthly is required');
  } else if (
    typeof data.subscription_price_monthly !== 'number' ||
    data.subscription_price_monthly < 0
  ) {
    errors.push('subscription_price_monthly must be a non-negative number');
  }

  // GLP type
  if (!data.glp_type) {
    errors.push('glp_type is required');
  } else if (data.glp_type !== 'glp1' && data.glp_type !== 'glp1_glp2') {
    errors.push('glp_type must be "glp1" or "glp1_glp2"');
  }

  // Optional but validated if present
  if (data.medication_cost_usd !== undefined && data.medication_cost_usd !== null) {
    if (typeof data.medication_cost_usd !== 'number' || data.medication_cost_usd < 0) {
      errors.push('medication_cost_usd must be a non-negative number');
    }
  }

  if (data.dose_mg_per_injection !== undefined && data.dose_mg_per_injection !== null) {
    if (typeof data.dose_mg_per_injection !== 'number' || data.dose_mg_per_injection <= 0) {
      errors.push('dose_mg_per_injection must be a positive number');
    }
  }

  // Warnings
  if (!data.product_url) warnings.push('product_url is missing (recommended)');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Build Tier-2 telehealth pricing object
 */
export function buildTelehealthPricing(data: any): TelehealthPricing {
  return {
    subscription_price_monthly: data.subscription_price_monthly,
    medication_cost_usd: data.medication_cost_usd || undefined,
    glp_type: data.glp_type,
    dose_mg_per_injection: data.dose_mg_per_injection || undefined,
  };
}

// ============================================================================
// TIER-3 (BRAND) VALIDATION
// ============================================================================

export const TIER3_VALIDATION_RULES = {
  vendor_name: { required: true },
  peptide_name: { required: true },
  vendor_url: { required: false },
  product_url: { required: false },
  dose_strength: { required: true },
  doses_per_package: { required: true, type: 'number', min: 1 },
  price_per_dose: { required: true, type: 'number', min: 0 },
  total_package_price: { required: false, type: 'number', min: 0 },
} as const;

/**
 * Validate Tier-3 (Brand) offer
 */
export function validateTier3Offer(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.vendor_name) errors.push('vendor_name is required');
  if (!data.peptide_name) errors.push('peptide_name is required');
  if (!data.dose_strength) errors.push('dose_strength is required');

  // Required pricing fields
  if (data.doses_per_package === undefined || data.doses_per_package === null) {
    errors.push('doses_per_package is required');
  } else if (typeof data.doses_per_package !== 'number' || data.doses_per_package < 1) {
    errors.push('doses_per_package must be at least 1');
  }

  if (data.price_per_dose === undefined || data.price_per_dose === null) {
    errors.push('price_per_dose is required');
  } else if (typeof data.price_per_dose !== 'number' || data.price_per_dose < 0) {
    errors.push('price_per_dose must be a non-negative number');
  }

  // Optional but validated if present
  if (data.total_package_price !== undefined && data.total_package_price !== null) {
    if (typeof data.total_package_price !== 'number' || data.total_package_price < 0) {
      errors.push('total_package_price must be a non-negative number');
    }
  }

  // Warnings
  if (!data.product_url) warnings.push('product_url is missing (recommended)');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Build Tier-3 brand pricing object
 */
export function buildBrandPricing(data: any): BrandPricing {
  return {
    dose_strength: data.dose_strength,
    doses_per_package: data.doses_per_package,
    price_per_dose: data.price_per_dose,
    total_package_price: data.total_package_price || undefined,
  };
}

// ============================================================================
// GENERIC VALIDATION
// ============================================================================

/**
 * Validate offer based on tier
 */
export function validateOfferByTier(tier: VendorTier, data: any): ValidationResult {
  switch (tier) {
    case 'research':
      return validateTier1Offer(data);
    case 'telehealth':
      return validateTier2Offer(data);
    case 'brand':
      return validateTier3Offer(data);
    default:
      return {
        isValid: false,
        errors: [`Unknown tier: ${tier}`],
        warnings: [],
      };
  }
}

/**
 * Build pricing object based on tier
 */
export function buildPricingByTier(
  tier: VendorTier,
  data: any
): ResearchPricing | TelehealthPricing | BrandPricing | null {
  switch (tier) {
    case 'research':
      return buildResearchPricing(data);
    case 'telehealth':
      return buildTelehealthPricing(data);
    case 'brand':
      return buildBrandPricing(data);
    default:
      throw new Error(`Unknown tier: ${tier}`);
  }
}

