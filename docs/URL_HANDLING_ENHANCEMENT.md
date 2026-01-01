# URL Handling Enhancement - Implementation Complete

## Overview

Enhanced the CSV import system to properly handle and update **vendor URLs** and **product URLs** during import operations.

## Changes Made

### 1. Type Updates

**File: `src/types/vendorComparison.ts`**

Added `product_url` field to vendor offers:

```typescript
export interface VendorOffer {
  // ... existing fields ...
  product_url?: string; // Direct link to the specific product page
  // ... rest of fields ...
}

export interface VendorOfferFormData {
  // ... existing fields ...
  product_url?: string;
  // ... rest of fields ...
}
```

### 2. CSV Header Aliases

**File: `src/lib/vendorTierValidators.ts`**

Added support for recognizing both vendor URLs and product URLs from CSV:

```typescript
export const CSV_HEADER_ALIASES: Record<string, string[]> = {
  // NEW: Vendor website URL
  vendor_url: ['vendor_url', 'vendor_website', 'website', 'vendor_website_url', 'company_url', 'company_website'],
  
  // NEW: Product-specific URL
  product_url: ['product_url', 'product_link', 'product_page', 'item_url', 'product_page_url', 'listing_url'],
  
  // UPDATED: pricing_source_url is now separate (for legacy/fallback only)
  pricing_source_url: ['pricing_source_url', 'pricing_source', 'source_url', 'link'],
  // ... other fields
};
```

### 3. CSV Parser

**File: `src/lib/csvParser.ts`**

Updated offer conversion to include product URLs:

```typescript
const baseOffer = {
  vendor_id: vendorId,
  tier,
  peptide_name: row.data.peptide_name,
  status: 'active',
  verification_status: 'unverified',
  verified_by: null,
  verified_at: null,
  price_source_type: 'csv_import',
  product_url: row.data.product_url || null, // NEW
  discount_code: row.data.discount_code || null,
  notes: row.data.notes || null,
};
```

### 4. Import Logic

**File: `src/hooks/useVendorPriceUpload.ts`**

#### 4a. Auto-Create Missing Vendors (Enhanced)

Now prioritizes `vendor_url` field over `pricing_source_url`:

```typescript
if (!vendorIdMap.has(normalizedVendorName)) {
  // Extract website URL from vendor_url field first, then fallback to pricing_source_url
  const websiteUrl = row.data.vendor_url || row.data.pricing_source_url || '';
  missingVendors.set(vendorName, websiteUrl);
}
```

#### 4b. Update Existing Vendor URLs (NEW FEATURE)

Automatically updates existing vendors' website URLs when provided in CSV:

```typescript
// 2b. Update existing vendors' website URLs if provided in CSV
const vendorUpdates = new Map<string, string>();

parseResult.success_rows.forEach((row) => {
  const vendorName = tier === 'brand' ? row.data.brand_name || row.data.vendor_name : row.data.vendor_name;
  const normalizedVendorName = normalizeVendorName(vendorName);
  const vendorId = vendorIdMap.get(normalizedVendorName);
  
  // If vendor_url is provided in CSV and vendor exists
  const newWebsiteUrl = row.data.vendor_url;
  if (vendorId && newWebsiteUrl && newWebsiteUrl.trim() !== '') {
    vendorUpdates.set(vendorId, newWebsiteUrl);
  }
});

// Apply vendor URL updates
for (const [vendorId, websiteUrl] of vendorUpdates) {
  const vendorRef = doc(db, 'vendors', vendorId);
  await updateDoc(vendorRef, {
    website_url: websiteUrl,
    updated_at: serverTimestamp(),
  });
}
```

## CSV Column Mapping

### Vendor URL

The system recognizes these column names for vendor website URLs:
- `vendor_url` (recommended)
- `vendor_website`
- `website`
- `vendor_website_url`
- `company_url`
- `company_website`

**Purpose:** Main website of the vendor/company

### Product URL

The system recognizes these column names for product-specific URLs:
- `product_url` (recommended)
- `product_link`
- `product_page`
- `item_url`
- `product_page_url`
- `listing_url`

**Purpose:** Direct link to the specific product listing

### Legacy/Fallback

- `pricing_source_url` - Still supported for backwards compatibility
  - Used as fallback for vendor URL if `vendor_url` is not provided
  - Can also be used for product URL in legacy CSVs

## Behavior

### Scenario 1: Auto-Create New Vendors

When importing a CSV with auto-create enabled:

| CSV Has | Result |
|---------|--------|
| `vendor_url` | Creates vendor with this URL |
| `pricing_source_url` (no `vendor_url`) | Creates vendor with `pricing_source_url` as fallback |
| Neither | Creates vendor with empty `website_url` |

### Scenario 2: Update Existing Vendors

When importing a CSV for existing vendors:

| CSV Has | Result |
|---------|--------|
| `vendor_url` column with URL | **Updates** vendor's `website_url` in database |
| `vendor_url` column but empty | No update (preserves existing URL) |
| No `vendor_url` column | No update (preserves existing URL) |

### Scenario 3: Product URLs

For all offers (new or updated):

| CSV Has | Result |
|---------|--------|
| `product_url` | Stores URL in offer's `product_url` field |
| No `product_url` | Offer's `product_url` is null |

## Example CSV Structure

### Research Peptides

```csv
vendor_name,vendor_url,peptide_name,product_url,size_mg,price_usd,shipping_usd,lab_test_url
Core Peptides,https://corepeptides.com,BPC-157,https://corepeptides.com/bpc-157-5mg,5,42.00,10.00,https://corepeptides.com/lab/bpc157
Amino USA,https://aminousa.com,KPV,https://aminousa.com/kpv-10mg,10,65.00,12.00,
```

### Telehealth

```csv
vendor_name,vendor_url,peptide_name,product_url,subscription_price_monthly,subscription_includes_medication,glp_type,dose_mg_per_injection,injections_per_month
Ro,https://ro.co,Semaglutide,https://ro.co/weight-loss/semaglutide,399.00,true,Semaglutide,2.5,4
```

### Brand

```csv
brand_name,vendor_url,peptide_name,product_url,dose_strength,price_per_dose,doses_per_package,total_package_price
Novo Nordisk,https://novonordisk.com,Semaglutide,https://novonordisk.com/wegovy,0.25mg,185.00,4,740.00
```

## User Benefits

### For Admins

1. **Vendor URLs Auto-Update**: No need to manually edit vendors when URLs change - just include updated URLs in the CSV
2. **Product Tracking**: Store direct links to product pages for easy reference and verification
3. **Flexible Import**: Works with both `vendor_url` and `product_url` columns, or legacy formats
4. **Auto-Create Smarter**: New vendors automatically get website URLs from CSV

### For Users

1. **Click to Vendor**: Direct links to vendor websites
2. **Click to Product**: Direct links to specific product pages (when provided)
3. **Verification**: Easy to verify pricing by clicking through to source

## Migration Notes

### Existing Data

- No migration needed for existing offers
- Existing offers will have `product_url: null` until re-imported with product URLs
- Existing vendors keep their URLs unless updated via CSV import

### CSV Templates

The CSV templates **do not need to be updated**. The system supports:
- ✅ Old CSVs without URL columns (backwards compatible)
- ✅ CSVs with `pricing_source_url` only (legacy fallback)
- ✅ CSVs with `vendor_url` and/or `product_url` (recommended)

## Testing Checklist

- [x] CSV with `vendor_url` creates vendors with correct URLs
- [x] CSV with `vendor_url` updates existing vendors' URLs
- [x] CSV with `product_url` stores product URLs in offers
- [x] Legacy CSVs with only `pricing_source_url` still work
- [x] CSVs without any URL columns still work (no regression)
- [x] Multiple URL column aliases recognized correctly
- [x] Empty URL columns don't overwrite existing data

## Database Schema

No Firestore schema changes required. The `product_url` field is optional and stored as:

```javascript
{
  // ... other offer fields ...
  product_url: "https://example.com/product/page" | null,
  // ... rest of fields ...
}
```

Vendor documents remain unchanged:

```javascript
{
  // ... other vendor fields ...
  website_url: "https://example.com",
  // ... rest of fields ...
}
```

---

**Implementation Date:** January 2026  
**Status:** ✅ Complete and Production Ready  
**Breaking Changes:** None (fully backwards compatible)  
**Linting:** ✅ All files pass without errors

