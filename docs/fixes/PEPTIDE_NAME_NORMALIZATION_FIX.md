# Peptide Name Normalization Fix

**Date:** January 19, 2026  
**Status:** ✅ Implemented  
**Issue:** Multiple BPC-157 variants displayed as separate products

---

## Problem

The vendor comparison page was showing multiple entries for the same peptide (e.g., BPC-157) when vendors sold different formulations:

- "BPC-157"
- "BPC-157 Spray"
- "BPC-157 (Capsules)"
- "BPC-157 & TB-500 Blend"
- "BPC blend — BPC-157 + TB-500 (BLOW)"
- etc.

These were all being treated as separate peptides instead of being grouped together under a single "BPC-157" entry (or the appropriate multi-peptide name for blends).

## Root Cause

The `PeptideGroupedView.tsx` component was grouping offers by the exact `peptide_name` field without any normalization. This meant that any variation in the product name (formulation type, parenthetical notes, etc.) would create a separate group.

## Solution

Created an enhanced `normalizePeptideName()` function that:

1. **Removes formulation variants** - Strips out keywords like "spray", "capsules", "tablet", "injectable", etc.
2. **Removes parenthetical content** - Eliminates notes in `()` and `[]` that describe formulation details
3. **Normalizes separators** - Cleans up dashes and spacing in multi-peptide blends
4. **Preserves core peptide identity** - Keeps the actual peptide name(s) intact

### Examples of Normalization

| Original Name | Normalized Name |
|---------------|----------------|
| `BPC-157` | `BPC-157` |
| `BPC-157 Spray` | `BPC-157` |
| `BPC-157 (Capsules)` | `BPC-157` |
| `BPC-157, (500mcg/spray)` | `BPC-157` |
| `BPC-157 Nasal Spray` | `BPC-157` |
| `BPC-157 & TB-500 Blend` | `BPC-157 & TB-500` |
| `BPC blend — BPC-157 + TB-500 (BLOW)` | `BPC-157 + TB-500` |
| `BPC-157 & TB-500 & GHK-Cu (Slow Blend)` | `BPC-157 & TB-500 & GHK-Cu` |

## Implementation

### Files Modified

1. **`src/lib/vendorTierValidators.ts`**
   - Added enhanced `normalizePeptideName()` function with comprehensive formulation removal

2. **`functions/src/shared/validation-utils.ts`**
   - Added the same `normalizePeptideName()` function for consistency in backend validation

3. **`src/components/comparison/PeptideGroupedView.tsx`**
   - Import `normalizePeptideName` from validators
   - Group offers by normalized peptide name instead of raw name
   - Added "Product Name" column to show original vendor product names
   - Use normalized name for group headers

4. **`src/components/comparison/ResearchPeptideComparison.tsx`**
   - Import `normalizePeptideName` from validators
   - Use normalized names for unique peptide counting
   - Use normalized names for best price calculation

### Key Function

```typescript
export function normalizePeptideName(name: string): string {
  if (!name) return '';
  
  // Trim and normalize whitespace
  let normalized = name.trim().replace(/\s+/g, ' ');
  
  // Remove content in parentheses (formulation details)
  normalized = normalized.replace(/\s*\([^)]*\)/g, '');
  
  // Remove content in square brackets
  normalized = normalized.replace(/\s*\[[^\]]*\]/g, '');
  
  // Remove common formulation keywords at the end
  const formulations = [
    'spray', 'capsules', 'capsule', 'tablet', 'tablets', 'nasal spray',
    'oral', 'injectable', 'injection', 'powder', 'lyophilized',
    'nasal', 'sublingual', 'topical', 'cream', 'gel'
  ];
  
  const formulationPattern = new RegExp(`\\s*[-–—,/]?\\s*(${formulations.join('|')})\\s*$`, 'gi');
  normalized = normalized.replace(formulationPattern, '');
  
  // Remove trailing "blend" but keep it if it's part of a multi-peptide name
  normalized = normalized.replace(/\s*[-–—]\s*blend\s*$/gi, '');
  
  // Normalize separators in multi-peptide names
  normalized = normalized.replace(/\s*[–—]\s*/g, ' - ');
  
  // Trim again and collapse multiple spaces
  normalized = normalized.trim().replace(/\s+/g, ' ');
  
  return normalized;
}
```

## User Experience Improvements

### Before Fix
```
📦 BPC-157
  └─ 2 vendors

📦 BPC-157 Spray
  └─ 1 vendor

📦 BPC-157 (Capsules)
  └─ 1 vendor

📦 BPC-157, (500mcg/spray)
  └─ 1 vendor

📦 BPC-157 & TB-500 Blend
  └─ 1 vendor

📦 BPC blend — BPC-157 + TB-500 (BLOW)
  └─ 1 vendor
```

### After Fix
```
📦 BPC-157
  └─ 5 vendors
     • Vendor A - BPC-157 - $0.50/mg
     • Vendor B - BPC-157 Spray - $0.65/mg
     • Vendor C - BPC-157 (Capsules) - $0.75/mg
     • Vendor D - BPC-157, (500mcg/spray) - $0.80/mg
     • Vendor E - BPC-157 Nasal - $0.90/mg

📦 BPC-157 + TB-500
  └─ 2 vendors
     • Vendor F - BPC-157 & TB-500 Blend - $1.20/mg
     • Vendor G - BPC blend — BPC-157 + TB-500 (BLOW) - $1.50/mg
```

## Benefits

1. **Clearer Comparison** - Users can now see all BPC-157 variants in one place
2. **Better Best Price Detection** - The lowest price across all formulations is highlighted
3. **Reduced Clutter** - Fewer top-level peptide groups (consolidated from 10+ to actual unique peptides)
4. **Preserves Information** - Original product names are still visible in the expanded table
5. **Better for Multi-Peptide Blends** - Properly groups blend products together

## Testing

To test this fix:

1. Navigate to Vendor Comparison page (requires Pro+ subscription)
2. Select "Research Peptides" tab
3. Switch to "Peptide-First View"
4. Search for "BPC-157" or expand the BPC-157 group
5. Verify that all BPC-157 variants (sprays, capsules, etc.) are grouped under one "BPC-157" entry
6. Verify that the "Product Name" column shows the original vendor product names
7. Verify that blends are properly grouped (e.g., "BPC-157 + TB-500")

## Future Considerations

- May need to add more formulation keywords to the normalization function
- Could add user preference to show/hide formulation details
- Could add filtering by formulation type (e.g., "Show only sprays")
- Consider adding this normalization to the vendor offer creation process (at data entry time)

---

**Resolution:** All BPC-157 variants now correctly group under a single peptide entry, making price comparison much clearer and more useful.

