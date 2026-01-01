# Vendor Comparison V1 - Quick Reference Card

**Last Updated**: December 27, 2025  
**Status**: ✅ Ready for Testing

---

## 🚀 Quick Start

### For QA/Testers
```bash
# 1. Seed data (first time only)
cd scripts
npx tsx seedVendorData.ts

# 2. Verify data integrity
npx tsx verifyVendorData.ts

# 3. Follow testing guide
# Open: docs/testing/QUICK_START_TESTING.md
```

### For Developers
```bash
# Deploy Firebase Functions
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Storage Rules
firebase deploy --only storage
```

---

## 📂 Key File Locations

| What | Where |
|------|-------|
| **Locked Spec** | `Vendor_Comparison_V1.md` |
| **Testing Checklist** | `docs/testing/VENDOR_COMPARISON_V1_TEST_CHECKLIST.md` |
| **Quick Test Guide** | `docs/testing/QUICK_START_TESTING.md` |
| **Implementation Summary** | `docs/VENDOR_COMPARISON_V1_SUMMARY.md` |
| **Seed Script** | `scripts/seedVendorData.ts` |
| **Verify Script** | `scripts/verifyVendorData.ts` |
| **Admin Panel** | `src/pages/Admin.tsx` → "Vendor Comparison" tab |
| **Public Page** | `src/pages/VendorComparison.tsx` |

---

## 🔑 Firebase Project Info

| Setting | Value |
|---------|-------|
| **Project ID** | `peptisync` |
| **Region** | `us-central1` |
| **Plan** | Blaze (pay-as-you-go) |
| **Console** | https://console.firebase.google.com/project/peptisync |

---

## 📊 Collections

| Collection | Purpose | Public Read | Admin Write |
|------------|---------|-------------|-------------|
| `vendors` | Vendor master data | ✅ | ✅ |
| `vendor_offers` | Pricing offers | ✅ (verified only) | ✅ |
| `tier3_reference_pricing` | Brand GLP reference prices | ✅ | ✅ |
| `vendor_price_uploads` | Upload history | ❌ | ✅ |
| `vendor_automation_jobs` | Automation logs | ❌ | ✅ |

---

## 🔧 Cloud Functions

| Function | Type | Schedule | Purpose |
|----------|------|----------|---------|
| `dailyTimestampUpdate` | Scheduled | Daily 2 AM UTC | Update `last_price_check` |
| `manualTimestampUpdate` | Callable | On-demand | Admin manual trigger |
| `getAutomationJobs` | Callable | On-demand | Fetch job history |

---

## 🎯 V1 Features

### Admin Panel (`/admin`)
- ✅ Vendor CRUD (create, edit, delete, verify)
- ✅ CSV/Excel upload (template download, preview, import)
- ✅ PDF upload with manual entry
- ✅ Review queue (verify/reject offers)
- ✅ Search and filter

### Public Page (`/vendor-comparison`)
- ✅ Research Peptides ($/mg comparison)
- ✅ Telehealth (subscription pricing)
- ✅ Brand GLPs (reference pricing)
- ✅ Search, sort, best price highlighting
- ✅ No authentication required

### Automation
- ✅ Daily timestamp updates (2 AM UTC)
- ✅ Job logging and history
- ✅ Manual trigger (admin callable)

---

## ⚠️ V1 Limitations (Intentional)

| Feature | V1 Status | V2 Plan |
|---------|-----------|---------|
| **Web Scraping** | ❌ Manual CSV only | ✅ Automated scraping |
| **PDF OCR** | ❌ Manual entry | ✅ OCR extraction |
| **Price Validation** | ❌ Human review | ✅ Anomaly detection |
| **Email Notifications** | ❌ None | ✅ Alerts for admins |
| **User Accounts** | ❌ Public read-only | ✅ Favorites, watchlists |

---

## 🧪 Critical Tests (Must Pass)

1. ✅ Seed 22 vendors, 15 offers, 4 Tier 3 references
2. ✅ Admin: Create, edit, delete vendor
3. ✅ CSV: Upload template with 2 valid rows, verify import
4. ✅ Review: Verify/reject offer, verify Firestore update
5. ✅ Public: All 3 tiers display, search/sort works
6. ✅ Automation: Manual trigger updates timestamps
7. ✅ Security: Public read works, non-admin write fails
8. ✅ Performance: Page load < 2s, query < 1s
9. ✅ Mobile: Responsive on 375px width
10. ✅ No cross-tier math anywhere

---

## 🐛 Troubleshooting

### "Permission denied" on Firestore
**Check**: Admin role in `userRoles` collection  
**Fix**: Add `{ role: "admin" }` to `userRoles/{user_uid}`

### "storage/unauthorized" on upload
**Check**: Firebase Storage rules deployed  
**Fix**: `firebase deploy --only storage`

### CSV shows all errors
**Check**: CSV headers match template exactly  
**Fix**: Download template, copy headers exactly

### Public page empty
**Check**: Seed script ran, offers verified  
**Fix**: Run `seedVendorData.ts`, verify `verification_status: 'verified'`

### Function not found
**Check**: Functions deployed  
**Fix**: `firebase deploy --only functions`

---

## 📞 Quick Commands

```bash
# Seed data
cd scripts && npx tsx seedVendorData.ts

# Verify data
cd scripts && npx tsx verifyVendorData.ts

# Deploy all
firebase deploy

# Deploy functions only
firebase deploy --only functions

# Deploy rules only
firebase deploy --only firestore:rules,storage

# View logs
firebase functions:log
```

---

## ✅ Production Checklist

- [ ] All tests passed (244 total, 188 critical)
- [ ] QA sign-off obtained
- [ ] Seed production data
- [ ] Verify production data
- [ ] Deploy frontend
- [ ] Deploy Firebase Functions
- [ ] Test public page (logged out)
- [ ] Test admin panel (logged in)
- [ ] Monitor logs (first 24 hours)
- [ ] Verify automation runs (next day 2 AM UTC)

---

## 🎓 Remember

- **V1 is intentionally manual** (CSV uploads, PDF entry, human verification)
- **No cross-tier math** (strict tier isolation enforced)
- **No inferred pricing** (only show what exists)
- **Verified-only public display** (unverified offers hidden from users)
- **Informational only** (no commerce, referrals, checkout)

---

**🎉 V1 is complete and ready for testing!**

*Need more details? See `docs/VENDOR_COMPARISON_V1_SUMMARY.md`*

