/**
 * CSV Parser for Vendor Comparison V1
 * 
 * Handles parsing of machine-generated CSV files for vendor pricing data
 * Features:
 * - Header-based parsing (order-independent)
 * - Case-insensitive matching
 * - Alias support for multiple header variations
 * - Lenient on extra columns
 * - Strict on required fields
 * - Per-row validation
 */

import Papa from 'papaparse';
import type {
  VendorTier,
  ParsedRow,
  CSVParseResult,
} from '@/types/vendorComparison';
import {
  mapHeaderToField,
  validateRow,
  parseBoolean,
  TIER1_VALIDATION_RULES,
  TIER2_VALIDATION_RULES,
  TIER3_VALIDATION_RULES,
  calculateResearchPricePerMg,
  calculateBrandTotalPrice,
  calculateTelehealthTotalMg,
  normalizeVendorName,
} from '@/lib/vendorTierValidators';

// ============================================================================
// CSV PARSING
// ============================================================================

/**
 * Parse CSV file with tier-specific validation
 */
export async function parseVendorCSV(
  file: File,
  tier: VendorTier
): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers and map to standard fields
        const mappedField = mapHeaderToField(header);
        return mappedField || header; // Keep original if no mapping found
      },
      transform: (value) => {
        // Trim whitespace from all values
        return typeof value === 'string' ? value.trim() : value;
      },
      complete: (results) => {
        try {
          const parseResult = processCSVResults(results.data, tier);
          resolve(parseResult);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Process parsed CSV data with tier-specific validation
 */
function processCSVResults(data: any[], tier: VendorTier): CSVParseResult {
  const successRows: ParsedRow[] = [];
  const errorRows: ParsedRow[] = [];
  const ignoredColumns = new Set<string>();

  // Get validation rules for tier
  const validationRules =
    tier === 'research'
      ? TIER1_VALIDATION_RULES
      : tier === 'telehealth'
      ? TIER2_VALIDATION_RULES
      : TIER3_VALIDATION_RULES;

  // Get required fields from validation rules
  const requiredFields = validationRules.filter((r) => r.required).map((r) => r.field);

  data.forEach((row, index) => {
    // Identify ignored columns (extra columns not in our schema)
    Object.keys(row).forEach((key) => {
      if (!requiredFields.includes(key) && !isKnownOptionalField(key, tier)) {
        ignoredColumns.add(key);
      }
    });

    // Clean up row data (remove ignored columns for processing)
    const cleanedRow = { ...row };
    ignoredColumns.forEach((col) => {
      delete cleanedRow[col];
    });

    // Parse boolean fields for Tier 2
    if (tier === 'telehealth') {
      if (cleanedRow.subscription_includes_medication !== undefined) {
        cleanedRow.subscription_includes_medication = parseBoolean(
          cleanedRow.subscription_includes_medication
        );
      }
      if (cleanedRow.consultation_included !== undefined) {
        cleanedRow.consultation_included = parseBoolean(cleanedRow.consultation_included);
      }
    }

    // Calculate derived fields
    if (tier === 'research' && cleanedRow.size_mg && cleanedRow.price_usd) {
      cleanedRow.price_per_mg = calculateResearchPricePerMg(
        cleanedRow.price_usd,
        cleanedRow.size_mg
      );
    }

    if (tier === 'telehealth' && cleanedRow.dose_mg_per_injection && cleanedRow.injections_per_month) {
      cleanedRow.total_mg_per_month = calculateTelehealthTotalMg(
        cleanedRow.dose_mg_per_injection,
        cleanedRow.injections_per_month
      );
    }

    if (
      tier === 'brand' &&
      cleanedRow.price_per_dose &&
      cleanedRow.doses_per_package
    ) {
      cleanedRow.total_package_price = calculateBrandTotalPrice(
        cleanedRow.price_per_dose,
        cleanedRow.doses_per_package
      );
    }

    // Validate row
    const validationErrors = validateRow(cleanedRow, validationRules);

    const parsedRow: ParsedRow = {
      row_number: index + 1,
      data: cleanedRow,
      validation_errors: validationErrors,
      is_valid: validationErrors.length === 0,
    };

    if (parsedRow.is_valid) {
      successRows.push(parsedRow);
    } else {
      errorRows.push(parsedRow);
    }
  });

  return {
    success_rows: successRows,
    error_rows: errorRows,
    ignored_columns: Array.from(ignoredColumns),
    total_rows: data.length,
    success_count: successRows.length,
    error_count: errorRows.length,
  };
}

/**
 * Check if field is a known optional field for the tier
 */
function isKnownOptionalField(field: string, tier: VendorTier): boolean {
  const optionalFields = {
    research: ['shipping_usd', 'lab_test_url', 'discount_code', 'notes', 'price_per_mg'],
    telehealth: [
      'medication_dose',
      'consultation_included',
      'medication_separate_cost',
      'discount_code',
      'notes',
    ],
    brand: ['total_package_price', 'discount_code', 'notes', 'product_url'],
  };

  return optionalFields[tier]?.includes(field) || false;
}

// ============================================================================
// CSV TEMPLATE GENERATION
// ============================================================================

/**
 * Generate CSV template for a specific tier
 */
export function generateCSVTemplate(tier: VendorTier): string {
  const templates = {
    research: `vendor_name,peptide_name,size_mg,price_usd,shipping_usd,lab_test_url
Peptide Sciences,BPC-157,5,45.00,12.00,https://example.com/lab-test
Core Peptides,BPC-157,5,42.00,10.00,`,

    telehealth: `vendor_name,peptide_name,subscription_price_monthly,subscription_includes_medication,medication_separate_cost,medication_dose,consultation_included
Ro,Semaglutide,399.00,true,0,,true
Hims,Semaglutide,199.00,false,70.00,2.5mg,true`,

    brand: `brand_name,peptide_name,dose_strength,price_per_dose,doses_per_package,total_package_price
Wegovy,Semaglutide,0.25mg,185.00,4,740.00
Ozempic,Semaglutide,0.5mg,225.00,4,900.00`,
  };

  return templates[tier];
}

/**
 * Download CSV template as file
 */
export function downloadCSVTemplate(tier: VendorTier) {
  const template = generateCSVTemplate(tier);
  const tierNames = {
    research: 'research_peptides',
    telehealth: 'telehealth_glp',
    brand: 'brand_glp',
  };
  const filename = `vendor_pricing_${tierNames[tier]}_template.csv`;

  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// BULK IMPORT
// ============================================================================

/**
 * Convert parsed rows to vendor offer format
 */
export function convertRowsToOffers(
  rows: ParsedRow[],
  tier: VendorTier,
  vendorIdMap: Map<string, string>
): any[] {
  return rows.map((row) => {
    const vendorName =
      tier === 'brand'
        ? row.data.brand_name || row.data.vendor_name
        : row.data.vendor_name;

    // Normalize the CSV vendor name the same way (trim, lowercase, collapse spaces)
    const normalizedVendorName = normalizeVendorName(vendorName);
    const vendorId = vendorIdMap.get(normalizedVendorName);

    if (!vendorId) {
      throw new Error(
        `Vendor "${vendorName}" not found. Please create vendor first or check spelling/spacing.`
      );
    }

    const baseOffer = {
      vendor_id: vendorId,
      tier,
      peptide_name: row.data.peptide_name,
      status: 'active',
      verification_status: 'unverified',
      verified_by: null,
      verified_at: null,
      price_source_type: 'csv_import',
      product_url: row.data.product_url || null,
      discount_code: row.data.discount_code || null,
      notes: row.data.notes || null,
    };

    // Add tier-specific pricing
    if (tier === 'research') {
      return {
        ...baseOffer,
        research_pricing: {
          size_mg: row.data.size_mg,
          price_usd: row.data.price_usd,
          price_per_mg: row.data.price_per_mg,
          shipping_usd: row.data.shipping_usd || 0,
          lab_test_url: row.data.lab_test_url || null,
        },
      };
    } else if (tier === 'telehealth') {
      return {
        ...baseOffer,
        telehealth_pricing: {
          subscription_price_monthly: row.data.subscription_price_monthly,
          subscription_includes_medication: row.data.subscription_includes_medication,
          medication_separate_cost: row.data.medication_separate_cost || null,
          consultation_included: row.data.consultation_included || false,
          required_fields_transparent: true,
          // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
          glp_type: row.data.glp_type,
          dose_mg_per_injection: row.data.dose_mg_per_injection,
          injections_per_month: row.data.injections_per_month,
          total_mg_per_month: row.data.total_mg_per_month,
          // DEPRECATED: Keep for backward compatibility
          medication_dose: row.data.medication_dose || null,
        },
      };
    } else {
      // brand
      return {
        ...baseOffer,
        brand_pricing: {
          dose_strength: row.data.dose_strength,
          price_per_dose: row.data.price_per_dose,
          doses_per_package: row.data.doses_per_package,
          total_package_price: row.data.total_package_price,
        },
      };
    }
  });
}

// ============================================================================
// EXCEL SUPPORT
// ============================================================================

/**
 * Parse Excel file (converts to CSV first)
 * Note: Papa Parse can handle Excel files directly in many cases
 */
export async function parseVendorExcel(
  file: File,
  tier: VendorTier
): Promise<CSVParseResult> {
  // For Phase 3, we'll use the same parser as CSV
  // Papa Parse handles Excel reasonably well
  // For more robust Excel support, consider adding xlsx library in future
  return parseVendorCSV(file, tier);
}

