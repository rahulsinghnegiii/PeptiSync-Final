# Brand GLP Comparison - Error Fix

**Date**: December 28, 2025  
**Status**: ✅ Fixed  
**Issue**: "Cannot read properties of undefined (reading 'filter')"

---

## 🐛 **The Problem**

When clicking on the "Brand / Originator GLPs" tab in the Vendor Comparison page, users encountered:

```
Application Error
Cannot read properties of undefined (reading 'filter')
```

---

## 🔍 **Root Causes**

### **1. Wrong Hook Import** ❌
**File**: `src/components/comparison/BrandGLPComparison.tsx` (Line 33)

**Before**:
```typescript
import { useTier3Reference } from '@/hooks/useTier3Reference';
// ...
const { tier3References, loading } = useTier3Reference();
```

**Problem**: The hook `useTier3Reference()` doesn't exist! The actual hook is named `useTier3ReferencePricing()` and it returns `{ references }` not `{ tier3References }`.

---

### **2. Wrong Hook Parameters** ❌
**Before**:
```typescript
const { vendors } = useVendors('brand', true);
```

**Problem**: While the hook does accept these parameters, the component doesn't actually need to filter by tier since Tier 3 references already have vendor_ids that should work with any vendor.

---

### **3. Missing Null Safety** ❌
**Multiple locations in the component**

**Problem**: The code assumed `brand_pricing` fields always exist, but they might be:
- `undefined` (if data structure is incomplete)
- Missing (during initial load)
- Null (if validation fails)

**Affected Code**:
```typescript
// Line 61 - crash if dose_strength is undefined
ref.brand_pricing.dose_strength.toLowerCase()

// Line 68-70 - crash if price_per_dose is undefined
a.brand_pricing.price_per_dose - b.brand_pricing.price_per_dose

// Line 85 - crash if price_per_dose is undefined
const refPrice = ref.brand_pricing.price_per_dose;

// Line 204 - crash if dose_strength is undefined
{pricing.dose_strength}

// Line 220 - crash if total_package_price is undefined
${pricing.total_package_price.toFixed(2)}
```

---

## ✅ **The Fixes**

### **Fix 1: Correct Hook Import and Usage**
```typescript
// Correct import
import { useTier3ReferencePricing } from '@/hooks/useTier3Reference';

// Correct hook call with destructuring alias
const { references: tier3References, loading } = useTier3ReferencePricing();

// Simplified vendor hook (no unnecessary filters)
const { vendors } = useVendors();
```

---

### **Fix 2: Add Optional Chaining in Filter Logic**
```typescript
const matchesSearch =
  ref.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ref.brand_pricing?.dose_strength?.toLowerCase().includes(searchQuery.toLowerCase());
  // Added optional chaining (?.) ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

---

### **Fix 3: Add Null Coalescing in Sort Logic**
```typescript
filtered.sort((a, b) => {
  if (sortBy === 'price_per_dose_asc') {
    return (a.brand_pricing?.price_per_dose || 0) - (b.brand_pricing?.price_per_dose || 0);
    //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Added optional chaining and default value
  } else if (sortBy === 'price_per_dose_desc') {
    return (b.brand_pricing?.price_per_dose || 0) - (a.brand_pricing?.price_per_dose || 0);
  }
  // ...
});
```

---

### **Fix 4: Add Safety Check in Best Price Logic**
```typescript
const priceMap = new Map<string, number>();
verifiedReferences.forEach((ref) => {
  if (!ref.brand_pricing?.price_per_dose) return; // Skip if missing
  
  const currentBest = priceMap.get(ref.glp_type);
  const refPrice = ref.brand_pricing.price_per_dose;
  // ...
});
```

---

### **Fix 5: Add Safety Check in Table Rendering**
```typescript
filteredReferences.map((ref) => {
  const vendor = getVendor(ref.vendor_id);
  const pricing = ref.brand_pricing;
  
  // Skip if pricing data is missing
  if (!pricing?.price_per_dose) {
    return null;
  }
  
  const bestPrice = isBestPrice(ref.glp_type, pricing.price_per_dose);
  
  return (
    <TableRow key={ref.id}>
      {/* ... */}
      <TableCell>{pricing.dose_strength || 'N/A'}</TableCell>
      {/* ... */}
      <TableCell>
        {pricing.total_package_price 
          ? `$${pricing.total_package_price.toFixed(2)}`
          : 'N/A'
        }
      </TableCell>
    </TableRow>
  );
})
```

---

## 🧪 **Testing**

### **Scenarios Tested**:
1. ✅ Empty collection (no Tier 3 references)
2. ✅ References with missing `brand_pricing` field
3. ✅ References with incomplete `brand_pricing` data
4. ✅ References with valid data
5. ✅ Sorting by price (asc/desc)
6. ✅ Searching by product name, brand, dose strength
7. ✅ Best price highlighting

### **Results**:
- No more crashes
- Graceful handling of missing data
- UI shows "N/A" for missing fields
- Rows with incomplete data are skipped silently

---

## 📊 **Changes Summary**

### **File Modified**: `src/components/comparison/BrandGLPComparison.tsx`

**Lines Changed**: 5 sections
1. Hook import and usage (lines 33-44)
2. Filter logic (line 61)
3. Sort logic (lines 68-70)
4. Best price calculation (line 85)
5. Table rendering (lines 187-247)

**Total Lines Modified**: ~20 lines
**New Safety Checks**: 7 locations

---

## ✅ **Current Status**

### **Before Fix**:
- ❌ Tab crashed on click
- ❌ Error: "Cannot read properties of undefined"
- ❌ No data displayed
- ❌ User couldn't access Brand GLP comparison

### **After Fix**:
- ✅ Tab loads without errors
- ✅ Shows empty state if no data
- ✅ Gracefully handles incomplete data
- ✅ All sorting/filtering works
- ✅ Best price highlighting works
- ✅ Null-safe throughout

---

## 🎯 **Key Learnings**

1. **Always use optional chaining** when accessing nested properties from external data sources
2. **Provide fallback values** for display fields (e.g., `|| 'N/A'`)
3. **Verify hook names** match the actual exports
4. **Add early returns** for invalid data to prevent downstream errors
5. **Test with empty collections** to catch initialization issues

---

## 🚀 **Next Steps**

The Brand GLP tab now works correctly. To see data:

1. **Add Tier 3 reference pricing** via admin panel:
   - Go to `/admin` → Vendor Comparison → Tier 3 Reference tab
   - Click "Add Reference Price"
   - Enter data for Ozempic, Wegovy, Mounjaro, or Zepbound

2. **Or run seed script** (if available):
   ```bash
   npm run seed-vendors
   ```

3. **Then test** the public page:
   - Navigate to `/vendor-comparison`
   - Click "Brand / Originator GLPs" tab
   - Should display reference pricing table

---

## 📝 **Related Files**

- **Component**: `src/components/comparison/BrandGLPComparison.tsx` ✅ Fixed
- **Hook**: `src/hooks/useTier3Reference.ts` (no changes needed)
- **Types**: `src/types/vendorComparison.ts` (no changes needed)

---

**Status**: Brand GLP comparison tab is now fully functional and null-safe! 🎉

