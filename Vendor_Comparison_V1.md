# PeptiSync — Vendor Comparison V1 (LOCKED SPEC)

This document is the **single source of truth** for Vendor Comparison V1.
It reflects a **signed agreement** and defines what V1 means, what is in scope, and what is out of scope.

---

## 1. What “V1” Means

Vendor Comparison V1 is a **complete, production-ready feature at initial launch**.

V1 is **NOT**:
- a beta-only build
- a partial or placeholder implementation
- a foundation to be “finished later”

Once V1 is live and functioning per this document, it is considered **delivered**.

---

## 2. Goal

Build **one Vendor Comparison feature** that accurately reflects the peptide and GLP market using:

- Tiered vendors
- Transparent pricing
- Dose clarity
- No inferred or misleading math

There must be:
- ❌ No cross-tier pricing math
- ❌ No inferred or averaged pricing
- ❌ No blended pricing logic

---

## 3. Feature Structure

Single Vendor Comparison entry point with tier selection:

- Tier 1 — Research Peptides
- Tier 2 — Telehealth & GLP Clinics
- Tier 3 — Brand / Originator GLPs

Each tier:
- Has its own vendors
- Has its own pricing rules
- Is isolated from the others

---

## 4. Tier 1 — Research Peptide Vendors

### Purpose
Direct price comparison of research-use peptides sold by vial.

### Vendors (V1)
- Peptide Sciences
- Core Peptides
- Amino USA
- Direct Peptides
- Biotech Peptides
- Iron Mountain Labz
- Pinnacle Peptides
- Longevity Peptides
- Peptide Pros
- Limitless Life Nootropics
- CanLab Research
- Peptalyon

### Pricing Display (Required)
- Price per vial
- mg per vial
- Calculated $/mg

### Rules
- Full price comparison enabled
- Sorting by:
  - $/mg
  - Alphabetical
- No subscriptions
- No GLP pricing logic

### Label
“Research Peptide Vendors — Pricing Verified (Beta)”

---

## 5. Tier 2 — Telehealth & GLP-1 Clinics

### Purpose
Compare GLP programs/subscriptions (not raw medication pricing).

### Vendors (V1)
- Ro
- Hims
- WeightWatchers
- Eden
- AgelessRx
- FitRx
- Fridays Health
- Citizen Meds

### Pricing Rules (LOCKED)
- ALWAYS show subscription/program price
- ONLY show medication cost if medication is NOT included
- NEVER divide subscription price to infer injection cost
- NEVER estimate medication cost when bundled

### Required Transparency (All Vendors)
- GLP type (Semaglutide or Tirzepatide)
- Dose per injection (mg)
- Injections per month
- Total mg supplied per month

### Example (Medication Included)
Subscription: $399 / month  
Medication: Included  
Dose: 1.0 mg per injection  
Total: 4 mg per month  

### Example (Medication Not Included)
Subscription: $199 / month  
Medication: $70 per injection  
Dose: 2.5 mg per injection  
Total: 10 mg per month  

---

## 6. Tier 3 — Brand / Originator GLPs

### Purpose
Dose-level transparency for FDA-approved GLP medications.

### Brands
- Novo Nordisk → Wegovy, Ozempic (Semaglutide)
- Eli Lilly → Zepbound, Mounjaro (Tirzepatide)

### Rules (LOCKED)
- No subscriptions
- Always show:
  - Cost per injection
  - Dose per injection
  - Total mg supplied per month
- Pricing based on manufacturer list or cash pricing
- Note that insurance/pharmacy pricing may vary

Tier 3 pricing is a **reference table**, editable by admin.

---

## 7. Global Rules (All Tiers)

- No “typical” or averaged pricing language
- No inferred pricing
- No cross-tier math
- Neutral vendor ordering

Optional disclaimer:
“Vendor listings are for informational comparison only.”

---

## 8. Required Core Fields (Data Model)

All tiers must be representable using:

- tier
- vendor_name
- glp_type
- dose_mg_per_injection
- injections_per_month
- total_mg_per_month
- subscription_price
- medication_included (true/false)
- med_cost_per_injection
- pricing_source
- verification_status
- last_checked_timestamp

---

## 9. Automation & Ingestion (V1)

Automation in V1 means:

- CSV / Excel ingestion
- Manual PDF upload with admin mapping
- Daily freshness tracking (timestamps)

Web scraping:
- Optional
- Not required for V1 delivery
- Architecture should allow adding later

No paid third-party scraping services are required for V1.

---

## 10. Admin Requirements

Admin must be able to:
- Manage vendors
- Upload CSV / Excel / PDF files
- Review and verify pricing
- Edit Tier 3 reference pricing
- See last-checked timestamps
- Mark pricing as Verified / Unverified

---

## 11. Delivery Criteria (V1 is Complete When)

Vendor Comparison V1 is considered delivered when:

- All three tiers are implemented and accessible
- Initial vendors for each tier are live
- Automation is active (uploads + timestamps)
- Comparison logic follows this spec exactly
- End users can view and compare pricing per tier
- No critical errors are present

---

## 12. Explicitly Out of Scope for V1

- Price history or charts
- OCR-based PDF parsing
- Mandatory web scraping
- Community price submissions
- Alerts or notifications
- Analytics
- Paid external services

These may be considered in future versions only.
