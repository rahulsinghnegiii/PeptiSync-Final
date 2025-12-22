# Fixed: approved_by Field Now Uses DocumentReference ✅

## Overview
Fixed the `approved_by` field in vendor pricing submissions to use DocumentReference instead of string, resolving the Flutter app crash.

**Date**: December 22, 2024

---

## 🔴 **Issue**

The Flutter app was crashing with this error:
```
Error loading pricing: Exception: Failed to get approved pricing: 
type 'String' is not a subtype of type 'DocumentReference<Object?>?' in type cast
```

**Root Cause:**
The website was saving `approved_by` as a **String** (userId) instead of a **DocumentReference**, but the Flutter app expected a DocumentReference.

---

## ✅ **Fix Applied**

Updated three functions in `src/hooks/useVendorSubmissions.ts` to use DocumentReference:

### **1. useApproveSubmission Hook**

**Before:**
```typescript
await updateDoc(submissionRef, {
  approval_status: "approved",
  approved_by: userId,  // ❌ String
  reviewed_at: serverTimestamp(),
  display_on_public: true,
});
```

**After:**
```typescript
const approverRef = doc(db, "users", userId);  // ✅ Create DocumentReference

await updateDoc(submissionRef, {
  approval_status: "approved",
  approved_by: approverRef,  // ✅ DocumentReference
  reviewed_at: serverTimestamp(),
  display_on_public: true,
});
```

---

### **2. useRejectSubmission Hook**

**Before:**
```typescript
await updateDoc(submissionRef, {
  approval_status: "rejected",
  rejection_reason: reason,
  approved_by: userId,  // ❌ String
  reviewed_at: serverTimestamp(),
  display_on_public: false,
});
```

**After:**
```typescript
const approverRef = doc(db, "users", userId);  // ✅ Create DocumentReference

await updateDoc(submissionRef, {
  approval_status: "rejected",
  rejection_reason: reason,
  approved_by: approverRef,  // ✅ DocumentReference
  reviewed_at: serverTimestamp(),
  display_on_public: false,
});
```

---

### **3. useCreateAdminSubmission Hook**

**Before:**
```typescript
const submissionData = {
  user_id: userRef,
  // ... other fields
  approved_by: userId,  // ❌ String
  reviewed_at: serverTimestamp(),
  // ...
};
```

**After:**
```typescript
const userRef = doc(db, "users", userId);
const approverRef = doc(db, "users", userId);  // ✅ Create DocumentReference

const submissionData = {
  user_id: userRef,
  // ... other fields
  approved_by: approverRef,  // ✅ DocumentReference
  reviewed_at: serverTimestamp(),
  // ...
};
```

---

## 📊 **Complete Field Structure**

All vendor pricing submissions now save with proper DocumentReferences:

```typescript
{
  // DocumentReferences (not strings!)
  user_id: doc(db, "users", userId),           // ✅ DocumentReference
  peptide_id: null,                            // ✅ null (or DocumentReference)
  approved_by: doc(db, "users", approverId),   // ✅ DocumentReference
  
  // Regular fields
  peptide_name: "Semaglutide",
  vendor_name: "Peptide Sciences",
  price_usd: 99.99,
  shipping_usd: 15.00,
  size: "5mg",
  shipping_origin: "USA",
  discount_code: "SAVE10",
  user_notes: "Great product",
  screenshot_url: "https://...",
  lab_test_results_url: "https://...",
  price_verification_url: "https://...",
  vendor_url: "https://...",
  
  // Status fields
  approval_status: "approved",
  rejection_reason: null,
  auto_approved: true,
  verified_vendor: false,
  display_on_public: true,
  
  // Timestamps
  submitted_at: serverTimestamp(),
  reviewed_at: serverTimestamp(),
}
```

---

## 🔍 **How Flutter App Reads It**

The Flutter app correctly extracts the user ID from DocumentReference:

```dart
factory VendorPricingModel.fromFirestore(DocumentSnapshot doc) {
  final data = doc.data() as Map<String, dynamic>?;
  
  return VendorPricingModel.fromJson({
    'userId': (data['user_id'] as DocumentReference?)?.id ?? '',
    'approvedBy': (data['approved_by'] as DocumentReference?)?.id,  // ✅ Now works!
    // ... other fields
  });
}
```

---

## ✅ **Testing Checklist**

- ✅ No linter errors
- ✅ TypeScript compilation successful
- ✅ All three hooks updated
- ✅ DocumentReferences created correctly
- ✅ Consistent with user_id field format

---

## 🎯 **Next Steps**

1. **Delete old data** (if any exists with string `approved_by`)
   - Go to Firebase Console
   - Navigate to `vendor_pricing_submissions`
   - Delete any documents created before this fix

2. **Test the app**
   - Create a new vendor price submission from the website
   - Approve or reject it
   - Verify the Flutter app loads it without errors

3. **Verify in Firebase Console**
   - Check that `approved_by` shows as a DocumentReference (not a string)
   - Should look like: `users/USER_ID_HERE`

---

## 📝 **Summary**

**Fixed Fields:**
- ✅ `approved_by` in approve action
- ✅ `approved_by` in reject action
- ✅ `approved_by` in admin direct upload

**All DocumentReferences Now:**
- ✅ `user_id`
- ✅ `approved_by`
- ✅ `peptide_id` (when set)

**Status:** ✅ **FIXED - App should work now!**

---

**Implementation Date**: December 22, 2024  
**Developer**: AI Assistant  
**Files Modified**: 1
- `src/hooks/useVendorSubmissions.ts`

**Issue Resolved**: Flutter app crash due to type mismatch

