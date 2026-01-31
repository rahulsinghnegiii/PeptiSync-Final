# Auto Import Peptides Feature

**Date:** January 19, 2026  
**Status:** ✅ Implemented  
**Feature:** Automatic import of new peptides from vendor offers into Educational Peptide Library

---

## Overview

The Auto Import feature allows administrators to automatically discover and import new peptides from the `vendor_offers` collection into the `peptide_library` collection. This eliminates manual data entry for peptides that have been scraped from vendor websites.

## Key Features

1. **Automatic Extraction**: Scans all vendor offers to find unique peptides
2. **Name Normalization**: Uses `normalizePeptideName()` to handle variants (e.g., "BPC-157 Spray" → "BPC-157")
3. **Duplicate Prevention**: Skips peptides that already exist in the library
4. **Category Inference**: Automatically assigns categories based on peptide name patterns
5. **Placeholder Data**: Uses sensible defaults when detailed information isn't available
6. **Hidden by Default**: New peptides are marked as `isVisible: false` for admin review
7. **Real-time Progress**: Shows live progress during import with peptide count and current processing status
8. **Comprehensive Results**: Displays success/failure/skipped counts with detailed error messages

## Architecture

```mermaid
flowchart TD
    A[Admin clicks Auto Import] --> B[Query vendor_offers]
    B --> C[Extract peptide_name fields]
    C --> D[Apply normalizePeptideName]
    D --> E[Create Set of unique names]
    E --> F[Query peptide_library]
    F --> G[Apply normalizePeptideName to existing]
    G --> H{Compare sets}
    H --> I[Filter out existing peptides]
    I --> J{Any new peptides?}
    J -->|No| K[Show "All exist" message]
    J -->|Yes| L[For each new peptide]
    L --> M[Infer category from name]
    M --> N[Create entry with placeholders]
    N --> O[Set isVisible: false]
    O --> P[Save to peptide_library]
    P --> Q[Show results summary]
```

## Implementation Files

### Created Files

1. **`src/hooks/useAutoImportPeptides.ts`**
   - Main hook with auto-import logic
   - Functions: `extractUniquePeptides`, `checkExistingPeptides`, `fetchPeptideDetails`, `createPeptideEntry`, `autoImportPeptides`
   - Exports `AutoImportResult` interface

2. **`src/components/admin/AutoImportDialog.tsx`**
   - Progress dialog component
   - Real-time progress bar
   - Results summary with success/skipped/failed counts
   - List of newly imported peptides
   - Error display

3. **`docs/features/AUTO_IMPORT_PEPTIDES_FEATURE.md`**
   - This documentation file

### Modified Files

1. **`src/components/admin/AdminPeptideLibrary.tsx`**
   - Added "Auto Import from Vendors" button
   - Integrated `useAutoImportPeptides` hook
   - Added `AutoImportDialog` component
   - Added handler function `handleAutoImport`

## Usage

### For Administrators

1. Navigate to **Admin Panel → Peptide Management → Educational Library** tab
2. Click the **"Auto Import from Vendors"** button (between "Bulk Import" and "Create New Entry")
3. The system will:
   - Scan all vendor offers
   - Find unique peptides
   - Skip existing ones
   - Import new ones with placeholder data
4. Review the results dialog showing:
   - Total peptides found
   - Number skipped (already exist)
   - Number successfully imported
   - Number failed (if any)
5. Close the dialog and review imported peptides in the table
6. Edit entries to add detailed information
7. Toggle visibility to make them public when ready

### Button Location

The "Auto Import from Vendors" button appears in the card header of the Educational Peptide Library page:

```
[Bulk Import] [Auto Import from Vendors] [Create New Entry] [Delete All]
```

## Category Inference

The system automatically assigns categories based on peptide name patterns:

| Category | Keywords |
|----------|----------|
| Recovery | bpc, tb-500, thymosin beta, ghk-cu, ghk |
| Growth | igf, cjc, ipamorelin, ghrp, hexarelin, sermorelin, follistatin |
| Weight Loss | aod, tesamorelin, semaglutide, tirzepatide |
| Immunity | thymosin alpha |
| Performance | melanotan, pt-141, mots-c, bremelanotide |
| Anti-aging | epitalon, epithalon |
| General | (default for unmatched patterns) |

## Placeholder Data

When detailed information is not available, the following placeholders are used:

```typescript
{
  shortDescription: "Peptide information pending review",
  description: "Detailed information for this peptide is being compiled. Please check back later.",
  mechanism: "Mechanism of action to be documented",
  commonDoses: "Consult healthcare provider for appropriate dosing",
  protocol: "Follow healthcare provider guidance",
  sideEffects: "Side effects profile under review",
  warnings: "This information is for educational purposes only. Always consult a licensed healthcare professional.",
  interactions: "Potential interactions to be documented",
  injectionAreas: "Administration method to be documented"
}
```

## Testing Checklist

### Manual Testing

- [x] Button appears in correct location on Educational Peptide Library page
- [x] Clicking button queries vendor_offers collection
- [x] Peptide names are correctly normalized (BPC-157 Spray → BPC-157)
- [x] Existing peptides are skipped (no duplicates created)
- [x] New peptides are added with isVisible: false
- [x] Categories are correctly inferred or default to "General"
- [x] Progress dialog shows accurate counts
- [x] Error handling works for API failures
- [x] Newly imported peptides appear in admin table (filtered view)
- [x] Admin can manually review and edit imported peptides
- [x] Admin can toggle visibility to make them public

### Test Scenarios

#### Scenario 1: First Import (No Existing Peptides)
**Steps:**
1. Clear peptide_library collection (or use fresh database)
2. Ensure vendor_offers has some peptides (e.g., BPC-157, TB-500, Semaglutide)
3. Click "Auto Import from Vendors"
4. Wait for completion

**Expected:**
- All unique normalized peptide names are imported
- All new entries have isVisible: false
- Categories are correctly assigned
- Success count matches number of unique peptides

#### Scenario 2: Subsequent Import (Some Existing)
**Steps:**
1. Have some peptides already in peptide_library (e.g., BPC-157)
2. Have additional peptides in vendor_offers (e.g., TB-500, Ipamorelin)
3. Click "Auto Import from Vendors"

**Expected:**
- Existing peptides are skipped (skipped count > 0)
- Only new peptides are imported
- No duplicates created
- Toast shows both success and skipped messages

#### Scenario 3: All Peptides Exist
**Steps:**
1. Import all peptides first
2. Click "Auto Import from Vendors" again

**Expected:**
- All peptides are skipped
- Success count = 0
- Skipped count = total found
- Message: "All peptides already exist in the library"

#### Scenario 4: Name Normalization
**Steps:**
1. Have vendor offers with variants:
   - "BPC-157"
   - "BPC-157 Spray"
   - "BPC-157 (Capsules)"
2. Click "Auto Import from Vendors"

**Expected:**
- Only 1 entry created for "BPC-157"
- Variants are normalized to same name
- No duplicates for different formulations

#### Scenario 5: Error Handling
**Steps:**
1. Simulate Firestore error (e.g., permissions issue)
2. Click "Auto Import from Vendors"

**Expected:**
- Error toast appears
- Dialog shows error details
- Failed count is accurate
- No partial imports

## Future Enhancements

### AI Integration (Placeholder Ready)

The `fetchPeptideDetails()` function in the hook is designed to integrate with AI APIs:

```typescript
// Future implementation example
const fetchPeptideDetails = async (peptideName: string) => {
  try {
    const response = await fetch('/api/peptide-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peptideName })
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null; // Fallback to placeholders
  } catch (error) {
    return null;
  }
};
```

### Potential AI Sources

- **OpenAI GPT-4**: Generate peptide descriptions and information
- **Anthropic Claude**: Detailed mechanism explanations
- **PubMed API**: Fetch scientific research data
- **Custom ML Model**: Trained on peptide literature

### Other Enhancements

1. **Batch Processing**: Process large imports in smaller batches
2. **Scheduling**: Auto-run imports daily/weekly
3. **Conflict Resolution**: Smart handling of name conflicts
4. **Approval Workflow**: Multi-step review process
5. **Change Detection**: Track when vendor data changes
6. **Source Attribution**: Link imported peptides back to original vendors

## Dependencies

- **Firebase Firestore**: `vendor_offers` and `peptide_library` collections
- **Normalization Function**: `normalizePeptideName` from `src/lib/vendorTierValidators.ts`
- **UI Components**: Button, Dialog, Progress, Badge, ScrollArea from shadcn/ui
- **Authentication**: Firebase Auth for user identification

## Security

- **Admin Only**: Feature is only accessible on admin pages
- **Authentication Required**: Checks `auth.currentUser` before import
- **Firestore Rules**: Respects existing security rules for collections
- **No Public Access**: Auto-imported peptides are hidden by default

## Performance Considerations

- **Rate Limiting**: 100ms delay every 10 peptides to avoid Firestore throttling
- **Batch Operations**: Uses single reads with efficient filtering
- **Progress Tracking**: Real-time updates without blocking UI
- **Async Processing**: Non-blocking import operation

## Troubleshooting

### Issue: "Not authenticated" error
**Solution:** Ensure user is logged in as admin before clicking import

### Issue: No peptides found
**Solution:** Verify vendor_offers collection has documents with peptide_name field

### Issue: All peptides skipped
**Solution:** This is normal if all peptides already exist. Check peptide_library collection.

### Issue: Import fails partway through
**Solution:** Check browser console for specific errors. Review Firestore security rules.

### Issue: Wrong categories assigned
**Solution:** Edit peptides manually after import. Categories are best-effort inference.

---

## Summary

The Auto Import Peptides feature streamlines the process of adding new peptides discovered by vendor scrapers into the educational library. It handles name normalization, duplicate prevention, and provides a smooth admin experience with real-time progress tracking and comprehensive results reporting.

**Status:** Production Ready ✅  
**Last Updated:** January 19, 2026

