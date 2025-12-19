# Firebase Migration - Quick Start Guide

## Immediate Steps to Get Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=AIzaSyBI536Q0lETlOIshhgN2u7lbezACWmroFE
VITE_FIREBASE_AUTH_DOMAIN=peptisync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=peptisync
VITE_FIREBASE_STORAGE_BUCKET=peptisync.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=220814444992
VITE_FIREBASE_APP_ID=1:220814444992:web:2f8140439b948f42cba025
VITE_FIREBASE_MEASUREMENT_ID=G-GEGRETMN3N
```

### 3. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 4. Login to Firebase
```bash
firebase login
```

### 5. Initialize Firebase Project
```bash
firebase init
```

Select:
- Firestore
- Storage
- Functions (optional)

When prompted, use existing project: `peptisync`

### 6. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

### 7. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 8. Start Development Server
```bash
npm run dev
```

## Testing the Migration

### Test Authentication
1. Go to `/auth`
2. Create a new account
3. Check email for verification
4. Sign in with credentials

### Test Products
1. Products should load on home page
2. Search and filter should work
3. Product details should display

### Test Cart
1. Add products to cart
2. Cart should update in real-time
3. Quantities should persist

## Setting Up Admin Access

### Option 1: Using Firebase Console
1. Go to Firebase Console → Authentication
2. Find your user
3. Copy the UID
4. Go to Firestore Database
5. Create document in `userRoles` collection:
   ```
   Document ID: {your-uid}
   Fields:
     uid: {your-uid}
     role: "admin"
     createdAt: {current timestamp}
   ```

### Option 2: Using Firebase Admin SDK
Create a Node.js script:

```javascript
const admin = require('firebase-admin');

admin.initializeApp();

async function setAdminRole(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
  
  await admin.firestore().collection('userRoles').doc(user.uid).set({
    uid: user.uid,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`Admin role set for ${email}`);
}

setAdminRole('your-email@example.com');
```

## Common Issues

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "Index required" error
**Solution**: Click the link in the error message to auto-create the index, or deploy all indexes:
```bash
firebase deploy --only firestore:indexes
```

### Issue: "Firebase config missing"
**Solution**: 
1. Check `.env` file exists
2. Verify all variables start with `VITE_`
3. Restart dev server

### Issue: Images not uploading
**Solution**: Deploy storage rules
```bash
firebase deploy --only storage
```

## What's Working

✅ User authentication (sign up, sign in, sign out)
✅ Email verification
✅ Password reset
✅ Product listing and search
✅ Cart management with real-time sync
✅ Image uploads (products and avatars)
✅ Reviews system
✅ Role-based authorization

## What Needs Manual Updates

The following components still have Supabase code that needs to be updated to Firebase:

### High Priority
- `src/pages/Dashboard.tsx` - User dashboard
- `src/pages/Checkout.tsx` - Checkout process
- `src/pages/OrderTracking.tsx` - Order tracking
- `src/components/admin/AdminProducts.tsx` - Product management
- `src/components/admin/AdminOrders.tsx` - Order management

### Medium Priority
- `src/pages/Settings.tsx` - User settings
- `src/components/settings/*` - Settings tabs
- `src/lib/email.ts` - Email functions

### Pattern to Follow

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();
```

**After (Firebase):**
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestoreHelpers';

const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = { id: docSnap.id, ...docSnap.data() };
}
```

## Next Development Steps

1. **Update remaining pages** - Follow the pattern in migrated files
2. **Test all features** - Ensure everything works end-to-end
3. **Add sample data** - Populate Firestore with test products
4. **Set up Cloud Functions** - For email and payment processing
5. **Deploy to production** - When ready

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Migration Guide](./FIREBASE_MIGRATION_COMPLETE.md)

## Need Help?

Check the comprehensive migration guide: `FIREBASE_MIGRATION_COMPLETE.md`

---

**Ready to go!** Start the dev server and begin testing. 🚀

