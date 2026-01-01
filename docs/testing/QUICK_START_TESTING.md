# Quick Start Testing Guide - Vendor Comparison V1

**Purpose**: Fast-track manual testing to verify all critical features work before production launch.

**Time Required**: ~30-45 minutes

---

## ⚡ Prerequisites (5 min)

1. **Firebase Setup**
   - [ ] Project ID: `peptisync`
   - [ ] Firestore database created
   - [ ] Firebase Auth enabled
   - [ ] Blaze plan active

2. **Admin Account**
   - [ ] Create admin user in Firebase Auth
   - [ ] Add role to Firestore:
     ```
     Collection: userRoles
     Document ID: {admin_user_uid}
     Fields: { role: "admin" }
     ```

3. **Seed Data**
   - [ ] Run: `cd scripts && npx tsx seedVendorData.ts`
   - [ ] Verify in Firestore: 22 vendors, 15 offers, 4 tier3 entries

---

## 🧪 Critical Path Tests (30 min)

### 1. Admin Vendor Management (5 min)

**Test**: Create, edit, delete vendor

```
1. Navigate to: /admin
2. Click "Vendor Comparison" tab
3. Click "Vendors" sub-tab
4. Click "Add New Vendor"
5. Fill: Name="Test Vendor", Tier=Research, URL=https://test.com
6. Save → Verify in list
7. Edit → Change name → Save
8. Delete → Confirm removed
```

**Expected**: All CRUD operations succeed, toast notifications appear

---

### 2. CSV Upload (5 min)

**Test**: Upload research peptide pricing

```
1. Navigate to: /admin → Vendor Comparison → Uploads
2. Click "CSV / Excel" tab
3. Select tier: "Research Peptides"
4. Click "Download Template"
5. Open CSV, add 2 rows:
   - Peptide Sciences,BPC-157,5,45.00,8.00,https://example.com/lab
   - AmericanRP,TB-500,10,95.00,10.00,https://example.com/lab2
6. Save CSV
7. Upload CSV file
8. Preview dialog shows 2 valid rows
9. Click "Import 2 Offers"
10. Verify success toast
```

**Expected**: CSV parses correctly, 2 new offers created in Firestore

---

### 3. Review & Verify (5 min)

**Test**: Verify uploaded offers

```
1. Navigate to: /admin → Vendor Comparison → Review Queue
2. See 2 unverified offers (from CSV upload)
3. Click eye icon → View details
4. Close dialog
5. Click edit icon → Modify price → Save
6. Click green checkmark icon → Verify offer
7. Verify badge changes to "Verified"
8. Check Firestore: verification_status = 'verified'
```

**Expected**: Offer verification works, Firestore updates correctly

---

### 4. Public Comparison Page (10 min)

**Test**: View all 3 tiers as public user

```
1. Log out (or open incognito window)
2. Navigate to: /vendor-comparison
3. Verify page loads (no auth required)
4. Click "Research Peptides" tab:
   - See table with verified offers
   - See "Best" badge on lowest $/mg
   - Verify vendor links work (open new tab)
5. Click "Telehealth & GLP Clinics" tab:
   - See subscription pricing
   - See "Medication Included" badges
   - Verify transparency alert visible
6. Click "Brand / Originator GLPs" tab:
   - See Ozempic, Wegovy, Mounjaro, Zepbound
   - See price per dose
   - Verify reference pricing note
7. Test search on each tier
8. Test sort options on each tier
```

**Expected**: All tiers display correctly, sorting/search works, no cross-tier math

---

### 5. Automation Function (5 min)

**Test**: Manual timestamp update

```
1. Open browser console
2. Paste and run:

import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const update = httpsCallable(functions, 'manualTimestampUpdate');
const result = await update();
console.log(result.data);

3. Verify response:
   - success: true
   - offers_processed: > 0
   - execution_time_ms: < 5000
4. Check Firestore vendor_offers:
   - last_price_check timestamps updated
5. Check vendor_automation_jobs:
   - New job log entry exists
```

**Expected**: Function executes, timestamps update, job logged

**Alternative** (if console doesn't work):
- Wait for scheduled run (tomorrow 2 AM UTC)
- Check Firebase Console → Functions → Logs
- Verify execution successful

---

## ✅ Success Criteria

If all 5 critical tests pass:
- ✅ **V1 is ready for production**
- ✅ All core features functional
- ✅ Admin workflows operational
- ✅ Public pages accessible
- ✅ Automation working

---

## 🐛 Common Issues & Fixes

### Issue: "Permission denied" on Firestore
**Fix**: Check Firestore rules deployed, verify admin role in `userRoles` collection

### Issue: "storage/unauthorized" on file upload
**Fix**: Check Storage rules deployed, verify user logged in as admin

### Issue: CSV preview shows all errors
**Fix**: Verify CSV headers match template exactly (case-sensitive for V1 template)

### Issue: Public page shows no data
**Fix**: Verify seed script ran, check offers have `verification_status: 'verified'`

### Issue: Automation function not found
**Fix**: Verify Firebase Functions deployed: `firebase deploy --only functions`

---

## 📞 Next Steps

After critical tests pass:

1. **Full QA**: Complete comprehensive checklist (`VENDOR_COMPARISON_V1_TEST_CHECKLIST.md`)
2. **Browser Testing**: Test on Chrome, Firefox, Safari, Mobile
3. **Performance**: Test with 100+ offers
4. **Production Deploy**: Deploy to production environment
5. **Monitor**: Watch logs for first 24 hours

---

**Questions or issues?** Document in test results and escalate before production launch.

