# CSV Website URL Import Fix

## Problem Identified

The CSV had a `pricing_source_url` column (Column G) containing vendor website URLs like:
- `https://aminousa.com/products/bpc-157`
- `https://www.peptidesciences.com/bpc-157`
- etc.

But when vendors were auto-created, they were showing **"No website"** because:
1. The CSV parser didn't recognize `pricing_source_url` as a valid header
2. The header wasn't in the `CSV_HEADER_ALIASES` mapping
3. Auto-created vendors defaulted to `website_url: ""`

## Solution Applied

### 1. **Added Header Alias Mapping**
Updated `src/lib/vendorTierValidators.ts`:

```typescript
pricing_source_url: ['pricing_source_url', 'pricing_source', 'source_url', 'product_url', 'vendor_url', 'link'],
```

Now the parser recognizes these column variations:
- `pricing_source_url` ✅
- `pricing_source` ✅
- `source_url` ✅
- `product_url` ✅
- `vendor_url` ✅
- `link` ✅

### 2. **Extract Website URL During Auto-Creation**
Updated `src/hooks/useVendorPriceUpload.ts`:

**Before:**
```typescript
const missingVendors = new Set<string>(); // Just vendor names
// ...
website_url: '', // Always empty
```

**After:**
```typescript
const missingVendors = new Map<string, string>(); // vendor name -> website URL
// ...
const websiteUrl = row.data.pricing_source_url || '';
missingVendors.set(vendorName, websiteUrl);
// ...
website_url: websiteUrl, // Use extracted URL from CSV
```

## Result

### **Before Fix:**
- CSV: `pricing_source_url = "https://aminousa.com/products/bpc-157"`
- Auto-created vendor: `website_url = ""` (empty)
- UI: "No website" (gray text, not clickable)

### **After Fix:**
- CSV: `pricing_source_url = "https://aminousa.com/products/bpc-157"`
- Auto-created vendor: `website_url = "https://aminousa.com/products/bpc-157"`
- UI: "Visit" link (blue, clickable, opens website) ✅

## Benefits

✅ **Preserves source URLs** - Vendors get their website from CSV  
✅ **Visit links work** - Clicking "Visit" opens the vendor website  
✅ **Traceability** - URLs show where prices came from  
✅ **Less manual work** - No need to manually add websites  
✅ **Product-specific** - URLs can point to specific product pages  

## CSV Column Support

Your CSV's column `pricing_source_url` will now be:
- ✅ Parsed correctly
- ✅ Extracted into `pricing_source_url` field
- ✅ Used to populate vendor `website_url`
- ✅ Displayed as clickable "Visit" link

## Testing

To test, re-import your CSV:
1. Go to **Upload** tab
2. Upload the same CSV again
3. Check **"Automatically create missing vendors"** ✓
4. Import offers
5. Go to **Vendors** tab
6. All vendors should now have clickable "Visit" links! 🎉

---

**Status:** ✅ Fixed and deployed  
**Files Modified:**
- `src/lib/vendorTierValidators.ts` - Added `pricing_source_url` aliases
- `src/hooks/useVendorPriceUpload.ts` - Extract and use website URLs

