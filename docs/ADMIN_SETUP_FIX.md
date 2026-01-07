# Admin Setup & Permission Fix

## Issue
The "Failed to save: Missing or insufficient permissions" error occurs because:
1. Your user account needs admin custom claims set in Firebase Auth
2. The Firestore security rules require admin role to write to `vendor_urls`

## Fix Implemented

### 1. Changed Frontend to Use Cloud Functions
- ✅ Frontend now calls `saveVendorUrls` Cloud Function (not direct Firestore write)
- ✅ Cloud Function handles permission checking and writes data
- ✅ More secure approach

### 2. Added Admin Management Functions
- ✅ `setAdminRole` - Set admin role for users
- ✅ `checkAdminRole` - Check if user is admin

---

## Setup Steps

### Step 1: Deploy Cloud Functions (REQUIRED)
```bash
cd functions
firebase deploy --only functions
```

This will deploy:
- `saveVendorUrls` - Save vendor URL config
- `getVendorUrls` - Get vendor URL config
- `testVendorScraper` - Test scraper
- `triggerScrapers` - Manual trigger
- `dailyScraperJob` - Scheduled job
- `setAdminRole` - Set admin permissions
- `checkAdminRole` - Check admin status

### Step 2: Set Yourself as Admin

#### Option A: Using Firebase Console (Easiest)
1. Go to Firebase Console → Authentication
2. Find your user account
3. Copy your **User UID**
4. Go to Firestore Database
5. Create collection: `userRoles`
6. Create document with ID = your User UID
7. Add field: `role` = `"admin"` (string)
8. Go to Firebase Console → Functions
9. Find `setAdminRole` function
10. Click "Test function"
11. Paste this JSON:
```json
{
  "userId": "YOUR_USER_UID_HERE"
}
```
12. Click "Run"

#### Option B: Using Firebase CLI (Advanced)
```bash
# Get your user ID first from Firebase Console → Authentication
firebase functions:call setAdminRole --data '{"userId":"YOUR_USER_UID"}'
```

#### Option C: Using Code (One-Time Script)
Create a temporary file `functions/set-admin.js`:
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const email = 'YOUR_EMAIL@example.com'; // Your login email

admin.auth().getUserByEmail(email)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log('Admin role set!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

Run it:
```bash
cd functions
node set-admin.js
```

### Step 3: Verify Admin Status
1. **Log out** of your app (important!)
2. **Log back in** (this refreshes your auth token with new claims)
3. Go to Admin Panel → Scraper Config
4. Try saving a vendor URL again

---

## Quick Test After Setup

1. Open Admin Panel → Scraper Config
2. Select "Amino USA"
3. Paste this URL:
   ```
   https://aminousa.com/collections/peptides
   ```
4. Click "Save Configuration"
5. Should see: ✅ "Configuration saved for Amino USA"

---

## Troubleshooting

### Still Getting Permission Error?
1. **Did you log out and back in?** Auth tokens are cached
2. **Did you deploy the functions?** Run `firebase deploy --only functions`
3. **Check Firestore userRoles collection**: Your UID should have `role: "admin"`
4. **Check Firebase Console → Authentication**: Your user should exist

### How to Verify Admin Status
Open browser console and run:
```javascript
// In your app, while logged in
const { getFunctions, httpsCallable } = await import('firebase/functions');
const functions = getFunctions();
const checkAdmin = httpsCallable(functions, 'checkAdminRole');
const result = await checkAdmin();
console.log(result.data);
// Should show: { isAdmin: true, userId: "..." }
```

### Fresh Start (Nuclear Option)
If nothing works:
```bash
# 1. Redeploy everything
cd functions
firebase deploy --only functions

# 2. Clear browser cache & cookies for your app domain

# 3. Set admin role via Firebase Console (Option A above)

# 4. Log out and back in

# 5. Test again
```

---

## Files Changed

### New Files:
- `functions/src/scrapers/vendor-urls.ts` - Cloud Functions for URL management
- `functions/src/admin/index.ts` - Admin role management

### Modified Files:
- `functions/src/scrapers/index.ts` - Export vendor-urls functions
- `functions/src/index.ts` - Export admin functions
- `src/hooks/useVendorUrls.ts` - Use Cloud Functions instead of direct Firestore

---

## What This Fixes

### Before (Broken):
```
Frontend → Direct Firestore Write to vendor_urls
           ↓
Firestore Rules: "Requires admin role"
           ↓
❌ Error: Missing or insufficient permissions
```

### After (Fixed):
```
Frontend → Cloud Function (saveVendorUrls)
           ↓
Cloud Function checks: context.auth.token.admin
           ↓
Cloud Function writes to vendor_urls
           ↓
✅ Success
```

---

## Next Steps After Fix

Once you can save URLs successfully:

1. **Configure Peptide Sciences** (test vendor)
   - URLs from plan:
     ```
     https://www.peptidesciences.com/peptides.html
     https://www.peptidesciences.com/bpc-157
     ```

2. **Test the scraper**
   - Click "Test Scraper" button
   - Review results

3. **Configure remaining vendors** (10-15 min total)
   - All URLs are in `v1.plan.md`

4. **Schedule daily job** (already deployed)
   - Runs automatically at 3 AM UTC
   - Or trigger manually via Admin UI

---

**Status**: ✅ Fixed - Deploy functions and set admin role to resolve

