# Vendor Pricing Error Fix - "Cannot read properties of undefined (reading 'toFixed')"

**Date:** December 19, 2024  
**Status:** ✅ Fixed

## Problem

The VendorPricingTable component was crashing with the error:
```
TypeError: Cannot read properties of undefined (reading 'toFixed')
at VendorPricingTable.tsx:64:41
```

This occurred when trying to display vendor pricing data because the `priceUsd` field was undefined.

## Root Cause

**Data Structure Mismatch**: Firebase stores data with snake_case field names (`price_usd`, `peptide_name`, `vendor_name`), but the TypeScript interface expects camelCase (`priceUsd`, `peptideName`, `vendorName`).

The hooks were fetching data from Firebase and spreading it directly into the TypeScript type without converting the field names:

```typescript
// PROBLEMATIC CODE
const data = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()  // ❌ This spreads snake_case fields
})) as VendorPriceSubmission[];
```

This resulted in objects like:
```javascript
{
  id: "abc123",
  price_usd: 99.99,        // ❌ snake_case from Firebase
  peptide_name: "BPC-157", // ❌ snake_case from Firebase
  priceUsd: undefined,     // ❌ TypeScript expects this
  peptideName: undefined   // ❌ TypeScript expects this
}
```

## Solution

### 1. Created Data Converter Function
Added a helper function to properly convert Firebase data to TypeScript format:

```typescript
const convertFirebaseData = (doc: any): VendorPriceSubmission => {
  const rawData = doc.data();
  return {
    id: doc.id,
    peptideId: rawData.peptide_id || null,
    peptideName: rawData.peptide_name || "",
    priceUsd: rawData.price_usd || 0,
    shippingOrigin: rawData.shipping_origin || "",
    vendorName: rawData.vendor_name || "",
    vendorUrl: rawData.vendor_url || "",
    discountCode: rawData.discount_code || "",
    screenshotUrl: rawData.screenshot_url || "",
    submittedBy: rawData.submitted_by || "",
    submittedAt: rawData.submitted_at,
    approvalStatus: rawData.approval_status || "pending",
    approvedBy: rawData.approved_by || "",
    reviewedAt: rawData.reviewed_at,
    rejectionReason: rawData.rejection_reason || "",
    autoApproved: rawData.auto_approved || false,
    verifiedVendor: rawData.verified_vendor || false,
    displayOnPublic: rawData.display_on_public || false,
  };
};
```

### 2. Updated Hooks to Use Converter
Modified both `useApprovedVendorPrices` and `useAllVendorSubmissions` hooks:

```typescript
// FIXED CODE
const snapshot = await getDocs(q);
const data = snapshot.docs.map(convertFirebaseData); // ✅ Proper conversion
```

### 3. Added Defensive Checks in Component
Enhanced the VendorPricingTable component with fallback values:

```typescript
// Safely get price value with fallback
const price = submission.priceUsd ?? (submission as any).price_usd ?? 0;
const peptideName = submission.peptideName || (submission as any).peptide_name || "Unknown";
const shippingOrigin = submission.shippingOrigin || (submission as any).shipping_origin || "Unknown";

// Safe rendering
${typeof price === 'number' ? price.toFixed(2) : '0.00'}
```

## Files Modified

1. **src/hooks/useVendorSubmissions.ts**
   - Added `convertFirebaseData` helper function
   - Updated `useApprovedVendorPrices` to use converter
   - Updated `useAllVendorSubmissions` to use converter

2. **src/components/vendor/VendorPricingTable.tsx**
   - Added defensive null checks
   - Added fallback values for all fields
   - Added type checking before calling `.toFixed()`

## Firebase Schema Reference

### Firestore Collection: `vendor_pricing_submissions`

**Field Names (snake_case):**
- `peptide_id` → TypeScript: `peptideId`
- `peptide_name` → TypeScript: `peptideName`
- `price_usd` → TypeScript: `priceUsd`
- `shipping_origin` → TypeScript: `shippingOrigin`
- `vendor_name` → TypeScript: `vendorName`
- `vendor_url` → TypeScript: `vendorUrl`
- `discount_code` → TypeScript: `discountCode`
- `screenshot_url` → TypeScript: `screenshotUrl`
- `submitted_by` → TypeScript: `submittedBy`
- `submitted_at` → TypeScript: `submittedAt`
- `approval_status` → TypeScript: `approvalStatus`
- `approved_by` → TypeScript: `approvedBy`
- `reviewed_at` → TypeScript: `reviewedAt`
- `rejection_reason` → TypeScript: `rejectionReason`
- `auto_approved` → TypeScript: `autoApproved`
- `verified_vendor` → TypeScript: `verifiedVendor`
- `display_on_public` → TypeScript: `displayOnPublic`

## Benefits of This Fix

1. **No More Crashes**: Proper data conversion prevents undefined errors
2. **Type Safety**: Data matches TypeScript interface expectations
3. **Defensive Programming**: Fallback values prevent future errors
4. **Maintainability**: Centralized conversion logic in one place
5. **Consistency**: All vendor pricing data follows the same pattern

## Testing

✅ Build successful with no errors  
✅ No TypeScript errors  
✅ Data properly converted from Firebase  
✅ Component renders without crashes  
✅ Fallback values work correctly  
✅ Price displays as "$99.99" format  

## Data Flow

```
Firebase (snake_case)
    ↓
convertFirebaseData()
    ↓
TypeScript (camelCase)
    ↓
VendorPricingTable Component
    ↓
Rendered UI
```

## Prevention

To prevent similar issues in the future:

1. **Always use converter functions** when fetching Firebase data
2. **Match field names** between Firebase schema and TypeScript types
3. **Add defensive checks** for critical data like prices
4. **Use fallback values** for optional fields
5. **Document schema** in FIREBASE_SCHEMA.md

## Related Documentation

- `FIREBASE_SCHEMA.md` - Complete Firebase collections documentation
- `src/types/vendor.ts` - TypeScript interface definitions
- `src/hooks/useVendorSubmissions.ts` - Data fetching hooks

## Conclusion

The error has been completely resolved by:
1. Adding proper data conversion from Firebase snake_case to TypeScript camelCase
2. Implementing defensive programming with null checks and fallbacks
3. Ensuring type safety throughout the data flow

The vendor pricing feature now works correctly and displays prices without errors!

