# Vendor Comparison V1 - Firestore Collections

This document describes the Firestore collections structure for Vendor Comparison V1 feature.

## Overview

The Vendor Comparison feature uses **4 primary collections**:
1. `vendors` - Master vendor directory
2. `vendor_offers` - Tier-specific pricing offers
3. `tier3_reference_pricing` - Admin-editable brand GLP reference
4. `vendor_price_uploads` - Upload tracking and processing

Plus **1 automation collection**:
5. `vendor_automation_jobs` - Job tracking (V1: timestamp updates only)

---

## Collection: `vendors`

**Purpose**: Master vendor directory across all tiers

**Security Rules**: 
- Public read
- Admin-only write

**Structure**:

```typescript
{
  id: string (auto-generated)
  name: string (required) // "Peptide Sciences", "Ro", "Novo Nordisk"
  type: 'research' | 'telehealth' | 'brand' (required)
  website_url: string (required)
  verified: boolean (default: false)
  verification_date: Timestamp | null
  
  // Optional metadata (not required for comparison logic)
  metadata?: {
    shipping_countries?: string[]
    accepts_crypto?: boolean
    lab_tested?: boolean
    subscription_required?: boolean
    originator_brand?: boolean
    // Extensible: admin can add custom fields
  }
  
  // Audit fields
  created_at: Timestamp
  updated_at: Timestamp
  created_by: string (user_id)
}
```

**Indexes Needed**:
- `type` (for tier filtering)
- `verified` (for verified-only filtering)
- `name` (for search/autocomplete)

**Example Document**:

```json
{
  "id": "vendor_abc123",
  "name": "Peptide Sciences",
  "type": "research",
  "website_url": "https://www.peptidesciences.com",
  "verified": true,
  "verification_date": "2025-12-27T10:00:00Z",
  "metadata": {
    "shipping_countries": ["US", "CA", "EU"],
    "lab_tested": true
  },
  "created_at": "2025-12-27T10:00:00Z",
  "updated_at": "2025-12-27T10:00:00Z",
  "created_by": "admin_user_id"
}
```

---

## Collection: `vendor_offers`

**Purpose**: Tier-specific pricing offers linked to vendors

**Security Rules**:
- Public read
- Authenticated users can create (for future community feature)
- Admin-only update/delete

**Structure**:

```typescript
{
  id: string (auto-generated)
  vendor_id: string (reference to vendors collection)
  tier: 'research' | 'telehealth' | 'brand'
  peptide_name: string (required)
  status: 'active' | 'inactive' | 'discontinued'
  
  // Tier-specific pricing (only one populated based on tier)
  research_pricing?: {
    size_mg: number
    price_usd: number
    price_per_mg: number (calculated: price_usd / size_mg)
    shipping_usd: number
    lab_test_url?: string
  }
  
  telehealth_pricing?: {
    subscription_price_monthly: number
    subscription_includes_medication: boolean
    medication_separate_cost?: number (ONLY if not included)
    medication_dose?: string
    consultation_included: boolean
    required_fields_transparent: boolean (must be true)
  }
  
  brand_pricing?: {
    dose_strength: string (e.g., "0.25mg", "0.5mg")
    price_per_dose: number
    doses_per_package: number
    total_package_price: number
  }
  
  // Verification
  verification_status: 'unverified' | 'verified' | 'disputed'
  verified_by: string | null
  verified_at: Timestamp | null
  last_price_check: Timestamp
  
  // Source tracking
  price_source_type: 'manual_upload' | 'csv_import' | 'pdf_upload' | 'automated_scrape'
  source_document_url?: string (for PDF uploads)
  
  // Optional fields
  discount_code?: string
  notes?: string
  
  // Audit fields
  created_at: Timestamp
  updated_at: Timestamp
  submitted_by: string (user_id)
}
```

**Indexes Needed**:
- Composite: `tier` + `peptide_name` + `verification_status`
- `vendor_id` (for vendor-specific queries)
- `verification_status` (for review queue)
- `last_price_check` (for staleness detection)

**Example Documents**:

**Tier 1 (Research)**:
```json
{
  "id": "offer_xyz789",
  "vendor_id": "vendor_abc123",
  "tier": "research",
  "peptide_name": "BPC-157",
  "status": "active",
  "research_pricing": {
    "size_mg": 5,
    "price_usd": 45.00,
    "price_per_mg": 9.00,
    "shipping_usd": 12.00
  },
  "verification_status": "verified",
  "verified_by": "admin_user_id",
  "verified_at": "2025-12-27T10:00:00Z",
  "last_price_check": "2025-12-27T10:00:00Z",
  "price_source_type": "csv_import",
  "created_at": "2025-12-27T10:00:00Z",
  "updated_at": "2025-12-27T10:00:00Z",
  "submitted_by": "admin_user_id"
}
```

**Tier 2 (Telehealth)**:
```json
{
  "id": "offer_def456",
  "vendor_id": "vendor_ghi789",
  "tier": "telehealth",
  "peptide_name": "Semaglutide",
  "status": "active",
  "telehealth_pricing": {
    "subscription_price_monthly": 399.00,
    "subscription_includes_medication": true,
    "medication_dose": "1.0mg per injection",
    "consultation_included": true,
    "required_fields_transparent": true
  },
  "verification_status": "verified",
  "verified_by": "admin_user_id",
  "verified_at": "2025-12-27T10:00:00Z",
  "last_price_check": "2025-12-27T10:00:00Z",
  "price_source_type": "manual_upload",
  "notes": "GLP type: Semaglutide, Injections per month: 4, Total: 4mg/month",
  "created_at": "2025-12-27T10:00:00Z",
  "updated_at": "2025-12-27T10:00:00Z",
  "submitted_by": "admin_user_id"
}
```

---

## Collection: `tier3_reference_pricing`

**Purpose**: Admin-editable reference table for brand GLP medications

**Security Rules**:
- Public read
- Admin-only write

**Structure**:

```typescript
{
  id: string (auto-generated)
  vendor_id: string (reference to brand vendors)
  product_name: string ("Wegovy", "Ozempic", "Zepbound", "Mounjaro")
  product_url?: string
  glp_type: 'Semaglutide' | 'Tirzepatide'
  tier: 'brand' (always brand)
  
  brand_pricing: {
    dose_strength: string
    price_per_dose: number
    doses_per_package: number
    total_package_price: number
  }
  
  pricing_source: string (e.g., "Manufacturer list price")
  verification_status: 'unverified' | 'verified' | 'disputed'
  verified_by: string | null
  verified_at: Timestamp | null
  last_price_check: Timestamp
  
  notes?: string
  
  // Audit fields
  created_at: Timestamp
  updated_at: Timestamp
  updated_by: string (user_id)
}
```

**Indexes Needed**:
- `vendor_id`
- `glp_type`
- `product_name`

**Example Document**:

```json
{
  "id": "ref_wegovy_001",
  "vendor_id": "vendor_novo_nordisk",
  "product_name": "Wegovy",
  "product_url": "https://www.wegovy.com",
  "glp_type": "Semaglutide",
  "tier": "brand",
  "brand_pricing": {
    "dose_strength": "0.25mg",
    "price_per_dose": 185.00,
    "doses_per_package": 4,
    "total_package_price": 740.00
  },
  "pricing_source": "Manufacturer list price",
  "verification_status": "verified",
  "verified_by": "admin_user_id",
  "verified_at": "2025-12-27T10:00:00Z",
  "last_price_check": "2025-12-27T10:00:00Z",
  "notes": "Starter dose, first month",
  "created_at": "2025-12-27T10:00:00Z",
  "updated_at": "2025-12-27T10:00:00Z",
  "updated_by": "admin_user_id"
}
```

---

## Collection: `vendor_price_uploads`

**Purpose**: Track CSV/PDF upload jobs and processing status

**Security Rules**:
- Owner + Admin read
- Authenticated users can create
- Admin-only update/delete

**Structure**:

```typescript
{
  id: string (auto-generated)
  upload_type: 'csv' | 'excel' | 'pdf'
  file_url: string (Firebase Storage path)
  file_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  tier: 'research' | 'telehealth' | 'brand'
  
  // For CSV/Excel - automatic parsing
  parsed_rows?: [
    {
      row_number: number
      data: object
      validation_errors: string[]
      is_valid: boolean
    }
  ]
  
  // For PDF - manual mapping
  pdf_mapping?: {
    vendor_id: string
    tier: string
    manual_entries: object[]
  }
  
  // Processing results
  total_rows: number
  success_count: number
  error_count: number
  errors?: string[]
  ignored_columns?: string[]
  
  // Audit
  uploaded_by: string (user_id)
  uploaded_at: Timestamp
  processed_at?: Timestamp
  processed_by?: string (admin user_id)
}
```

**Indexes Needed**:
- `uploaded_by` + `uploaded_at`
- `status`
- `tier`

---

## Collection: `vendor_automation_jobs`

**Purpose**: Track automated jobs (V1: timestamp updates only)

**Security Rules**:
- Admin-only read/write

**Structure**:

```typescript
{
  id: string (auto-generated)
  job_type: 'daily_price_check' | 'vendor_scrape' | 'csv_import'
  status: 'scheduled' | 'running' | 'completed' | 'failed'
  vendor_id?: string (if vendor-specific, null for global jobs)
  started_at: Timestamp
  completed_at?: Timestamp
  results: {
    offers_checked: number
    offers_updated: number
    errors: string[]
  }
}
```

**V1 Usage**: Only `daily_price_check` job type used (updates timestamps)

**V2+ Usage**: Add `vendor_scrape` job type when scrapers are implemented

---

## Query Patterns

### Public Comparison Queries

**Get all Tier 1 offers for a peptide (verified only)**:
```typescript
const q = query(
  collection(db, 'vendor_offers'),
  where('tier', '==', 'research'),
  where('peptide_name', '==', 'BPC-157'),
  where('verification_status', '==', 'verified'),
  where('status', '==', 'active'),
  orderBy('research_pricing.price_per_mg', 'asc')
);
```

**Get all Tier 2 offers (telehealth)**:
```typescript
const q = query(
  collection(db, 'vendor_offers'),
  where('tier', '==', 'telehealth'),
  where('status', '==', 'active'),
  orderBy('telehealth_pricing.subscription_price_monthly', 'asc')
);
```

**Get Tier 3 reference pricing**:
```typescript
const q = query(
  collection(db, 'tier3_reference_pricing'),
  where('tier', '==', 'brand'),
  where('verification_status', '==', 'verified'),
  orderBy('brand_pricing.price_per_dose', 'asc')
);
```

### Admin Queries

**Get unverified offers for review queue**:
```typescript
const q = query(
  collection(db, 'vendor_offers'),
  where('verification_status', '==', 'unverified'),
  orderBy('created_at', 'desc')
);
```

**Get stale offers (not checked in 7+ days)**:
```typescript
const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
const q = query(
  collection(db, 'vendor_offers'),
  where('last_price_check', '<', sevenDaysAgo)
);
```

---

## Data Integrity Rules

### Tier Isolation
- An offer MUST have only one pricing object (research_pricing XOR telehealth_pricing XOR brand_pricing)
- Tier field MUST match the populated pricing object
- Cross-tier queries are prohibited by application logic

### Verification Requirements
- Tier 2: `required_fields_transparent` MUST be true for verified offers
- Tier 2: If `subscription_includes_medication` is false, `medication_separate_cost` MUST be provided
- All tiers: `last_price_check` updated by daily job

### Calculation Rules
- Tier 1: `price_per_mg` = `price_usd` / `size_mg`
- Tier 3: `total_package_price` = `price_per_dose` * `doses_per_package`
- Tier 2: NO cost-per-dose calculation allowed (subscription price CANNOT be divided)

---

## Migration from Legacy System

**Legacy Collection**: `vendor_pricing_submissions` (DO NOT DELETE)

**Strategy**:
- Leave legacy collection untouched (archive only)
- New Vendor Comparison V1 uses new collections exclusively
- Optional: One-time migration script to extract useful data (not required for V1)

**Key Differences**:
- Legacy: Generic pricing, no tier structure
- V1: Tier-specific pricing with isolated logic
- Legacy: Single collection for all data
- V1: Separate collections for vendors, offers, and references

---

## Performance Considerations

### Estimated Scale (Year 1)
- Vendors: 50-100 documents
- Vendor Offers: 500-1000 documents
- Tier 3 Reference: 10-20 documents
- Uploads: 100-500 documents/year
- Automation Jobs: 365 documents/year

### Firestore Costs (Estimated)
- Reads: ~10,000/month (public comparison pages)
- Writes: ~1,000/month (admin updates + daily job)
- Storage: <1GB
- **Total Cost**: Within free tier or <$5/month

### Optimization
- Use client-side caching (React Query with 5-minute stale time)
- Limit public queries to active + verified offers only
- Archive old offers (status='discontinued') to subcollection if needed

---

## Backup & Recovery

**Recommendation**: Enable Firestore daily backups for production

**Critical Collections**:
- `vendors` (master data)
- `vendor_offers` (pricing data)
- `tier3_reference_pricing` (reference data)

**Non-Critical Collections**:
- `vendor_price_uploads` (can be re-uploaded if lost)
- `vendor_automation_jobs` (logs only, can be regenerated)

