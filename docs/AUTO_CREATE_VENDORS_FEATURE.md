# Auto-Create Vendors Feature

## Overview
Added the ability to automatically create missing vendors during CSV import, eliminating the "Vendor not found" error.

## What Was Implemented

### 1. **UploadPreviewDialog UI Update**
- Added checkbox: "Automatically create missing vendors" (checked by default)
- Placed in the dialog footer for easy access
- User can toggle before importing

### 2. **Import Logic Enhancement**
- Modified `useBulkImportOffers` hook to accept `autoCreateVendors` parameter
- Before converting rows to offers, the system now:
  1. Identifies all missing vendors from the CSV
  2. Creates them automatically if checkbox is enabled
  3. Adds them to the vendor ID map
  4. Proceeds with offer import

### 3. **Auto-Created Vendor Metadata**
New vendors created automatically include:
- `name`: Vendor name from CSV
- `type`: Tier (research/telehealth/brand)
- `website_url`: Empty (can be filled later)
- `verified`: false
- `metadata.auto_created`: true
- `metadata.created_from`: 'csv_import'
- `created_by`: Admin user ID
- Timestamps: `created_at`, `updated_at`

## User Flow

### Before (Old Behavior)
1. Admin uploads CSV with vendor "Amino USA"
2. System checks if vendor exists
3. **Error**: "Vendor 'Amino USA' not found. Please create vendor first."
4. Admin must:
   - Go to Vendors tab
   - Manually create vendor
   - Return to Upload tab
   - Re-upload CSV

### After (New Behavior)
1. Admin uploads CSV with vendor "Amino USA"
2. Upload preview shows 69 valid rows
3. Checkbox enabled: "Automatically create missing vendors" ✓
4. Admin clicks "Import 69 Offers"
5. System automatically creates "Amino USA" vendor
6. Toast: "Auto-created 1 missing vendor(s)"
7. All 69 offers imported successfully ✅

## Benefits

✅ **Saves Time**: No manual vendor creation needed  
✅ **Reduces Errors**: Eliminates spelling/spacing issues  
✅ **Bulk Import Friendly**: Import large CSVs without pre-setup  
✅ **Safe Default**: Checkbox is enabled by default  
✅ **Flexible**: Can be disabled if admin wants manual control  
✅ **Traceable**: Auto-created vendors are flagged in metadata  

## Technical Details

### Files Modified
1. `src/components/admin/vendorComparison/UploadPreviewDialog.tsx`
   - Added checkbox UI
   - Updated `onImport` to pass `autoCreateVendors` parameter

2. `src/hooks/useVendorPriceUpload.ts`
   - Updated `importOffers` function signature
   - Added auto-creation logic before `convertRowsToOffers`
   - Creates vendors with `metadata.auto_created = true`

3. `src/components/admin/vendorComparison/UploadTab.tsx`
   - Updated `handleImport` to accept and pass parameter

### Vendor Name Normalization
The system uses the same normalization for matching:
- Trims whitespace
- Converts to lowercase
- Collapses multiple spaces

This ensures "Amino USA", " amino usa ", and "AMINO  USA" are all matched correctly.

### Database Structure
Auto-created vendors:
```json
{
  "name": "Amino USA",
  "type": "research",
  "website_url": "",
  "verified": false,
  "verification_date": null,
  "metadata": {
    "auto_created": true,
    "created_from": "csv_import"
  },
  "created_at": "2026-01-01T10:55:00Z",
  "updated_at": "2026-01-01T10:55:00Z",
  "created_by": "admin_user_id"
}
```

## Edge Cases Handled

1. **Duplicate names in CSV**: Only creates once
2. **Case/spacing variations**: Normalized matching prevents duplicates
3. **Mixed existing/new vendors**: Only creates missing ones
4. **Multiple missing vendors**: Creates all in one batch
5. **Large imports**: Efficient batch processing

## Future Enhancements (Optional)

- Add "Review auto-created vendors" link after import
- Allow bulk editing of auto-created vendors
- Import vendor website URLs from CSV if available
- Suggest vendor verification after auto-creation

---

**Status:** ✅ Complete and deployed
**Testing:** Ready for production use

