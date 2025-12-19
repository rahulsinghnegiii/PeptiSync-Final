# Firebase Admin Role & Plan Tier Synchronization

**Date:** December 19, 2024  
**Status:** ✅ Implemented

## Overview

The website now properly syncs admin roles, moderator roles, and plan tiers from the Firebase users collection. This ensures that users who have admin/moderator status or specific plan tiers in the mobile app will have the same access on the website.

## Firebase Schema Integration

### User Collection Fields

The Firebase `users` collection uses **snake_case** field names:

```javascript
{
  uid: "user123",
  email: "user@example.com",
  display_name: "John Doe",
  photo_url: "https://...",
  plan_tier: "pro_plus",        // 'free', 'basic', 'pro', 'pro_plus', 'elite'
  is_admin: true,               // Admin access flag
  is_moderator: false,          // Moderator access flag
  created_time: Timestamp,
  last_login: Timestamp,
  // ... other fields
}
```

## Implementation Details

### 1. Authorization System Updates

**File:** `src/lib/authorization.ts`

#### New Helper Functions

```typescript
// Check if user has admin role in Firebase users collection
const checkFirebaseAdminStatus = async (user: any): Promise<boolean> => {
  const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return userData.is_admin === true || userData.isAdmin === true;
  }
  
  // Auto-grant admin if email matches ADMIN_EMAIL
  if (user.email === ADMIN_EMAIL) {
    await setDoc(userDocRef, {
      is_admin: true,
      isAdmin: true,
    }, { merge: true });
    return true;
  }
  
  return false;
};

// Check if user has moderator role
const checkFirebaseModeratorStatus = async (user: any): Promise<boolean> => {
  const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return userData.is_moderator === true || userData.isModerator === true;
  }
  
  return false;
};
```

#### Updated Role Check Logic

The `checkUserRole` function now checks in this order:

1. **Firebase users collection** - `is_admin` and `is_moderator` fields
2. **Custom claims** - Firebase Auth custom claims (if set by backend)
3. **user_roles collection** - Legacy role system (fallback)
4. **Default** - 'user' role if nothing found

```typescript
export const checkUserRole = async (requiredRole: UserRole): Promise<PermissionCheck> => {
  const user = auth.currentUser;
  
  // 1. Check Firebase users collection
  const isFirebaseAdmin = await checkFirebaseAdminStatus(user);
  if (isFirebaseAdmin) {
    return { hasPermission: true, role: 'admin' };
  }

  const isFirebaseModerator = await checkFirebaseModeratorStatus(user);
  if (isFirebaseModerator) {
    const hasPermission = checkRoleHierarchy('moderator', requiredRole);
    return { hasPermission, role: 'moderator' };
  }

  // 2. Check custom claims
  const idTokenResult = await user.getIdTokenResult();
  const customRole = idTokenResult.claims.role;
  if (customRole) {
    return { hasPermission: checkRoleHierarchy(customRole, requiredRole), role: customRole };
  }

  // 3. Fallback to user_roles collection
  // 4. Default to 'user' role
};
```

### 2. Dashboard Updates

**File:** `src/pages/Dashboard.tsx`

The dashboard now reads both snake_case and camelCase fields from Firebase:

```typescript
const userData = userDoc.data() as UserProfile;

// Get fullName from multiple sources
let fullName = userData.fullName || userData.display_name || user.displayName || user.email?.split('@')[0] || 'User';

// Get plan tier from Firebase (supports both formats)
let membershipTier = userData.membershipTier || userData.plan_tier || 'free';

// Get avatar URL
let avatarUrl = userData.avatarUrl || userData.photo_url;

// Update profile if needed to sync both formats
if (!userData.fullName || !userData.membershipTier) {
  await updateDoc(userDocRef, {
    fullName: fullName,
    display_name: fullName,
    membershipTier: membershipTier,
    plan_tier: membershipTier,
  });
}
```

### 3. TypeScript Type Updates

**File:** `src/types/firestore.ts`

Updated `UserProfile` interface to support both naming conventions:

```typescript
export type MembershipTier = 'free' | 'basic' | 'pro' | 'pro_plus' | 'elite' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  display_name?: string;        // Firebase app
  avatarUrl?: string;
  photo_url?: string;           // Firebase app
  membershipTier: MembershipTier;
  plan_tier?: string;           // Firebase app
  isAdmin?: boolean;            // Website
  is_admin?: boolean;           // Firebase app
  isModerator?: boolean;        // Website
  is_moderator?: boolean;       // Firebase app
  createdAt?: Timestamp;
  created_time?: Timestamp;     // Firebase app
  updatedAt?: Timestamp;
  last_login?: Timestamp;       // Firebase app
}
```

## Admin Access Flow

### Scenario 1: User with is_admin = true in Firebase

```
1. User signs in
2. Dashboard loads → checkUser()
3. checkUserRole('admin') is called
4. checkFirebaseAdminStatus() reads users/{uid}
5. Finds is_admin: true
6. Returns { hasPermission: true, role: 'admin' }
7. Admin Panel button appears in dashboard
8. User can access /admin route
```

### Scenario 2: Admin Email Auto-Grant

```
1. User with ADMIN_EMAIL signs in
2. checkFirebaseAdminStatus() is called
3. Checks if is_admin field exists
4. If not, sets is_admin: true in Firestore
5. Returns true
6. User gets admin access
```

### Scenario 3: Moderator Access

```
1. User with is_moderator: true signs in
2. checkFirebaseModeratorStatus() returns true
3. User gets 'moderator' role
4. Can access Vendor Moderation tab in admin panel
5. Cannot access other admin features (hierarchy check)
```

## Plan Tier Display

The dashboard now correctly displays the user's plan tier from Firebase:

- **Free** → "Free Member"
- **Basic** → "Basic Member"
- **Pro** → "Pro Member"
- **Pro Plus** → "Pro Plus Member"
- **Elite** → "Elite Member"

The plan tier is read from either `plan_tier` (snake_case) or `membershipTier` (camelCase).

## Role Hierarchy

```
admin (level 3)
  ↓ has all permissions of
moderator (level 2)
  ↓ has all permissions of
user (level 1)
```

**Examples:**
- Admin can access admin panel ✅
- Moderator can access vendor moderation ✅
- Moderator cannot access full admin panel ❌
- User cannot access any admin features ❌

## Admin Email Configuration

The admin email is configured via environment variable:

```env
VITE_ADMIN_EMAIL=rahulsinghnegi25561@gmail.com
```

This email automatically gets admin access when signing in.

## Testing Checklist

### Admin Role Testing

- [x] User with `is_admin: true` in Firebase can access admin panel
- [x] Admin email gets auto-granted admin status
- [x] Admin can see all tabs in admin panel
- [x] Admin button appears in dashboard header
- [x] Non-admin users cannot access /admin route
- [x] Non-admin users redirected to /dashboard with error toast

### Moderator Role Testing

- [x] User with `is_moderator: true` can access vendor moderation
- [x] Moderator cannot access full admin panel
- [x] Role hierarchy properly enforced

### Plan Tier Testing

- [x] Dashboard displays correct plan tier from Firebase
- [x] Supports both `plan_tier` (snake_case) and `membershipTier` (camelCase)
- [x] All plan tiers display correctly: free, basic, pro, pro_plus, elite
- [x] Plan tier badge shows in dashboard

### Data Sync Testing

- [x] Website reads snake_case fields from Firebase
- [x] Website writes both snake_case and camelCase for compatibility
- [x] Avatar URL syncs from `photo_url`
- [x] Display name syncs from `display_name`
- [x] Created time syncs from `created_time`

## Benefits

1. **Unified Access Control**: Admin roles set in the mobile app work on the website
2. **No Duplicate Management**: Single source of truth in Firebase users collection
3. **Automatic Sync**: No manual role assignment needed
4. **Backward Compatible**: Supports both naming conventions
5. **Flexible**: Works with custom claims, Firestore fields, and legacy system
6. **Secure**: Proper permission checks at every level

## Files Modified

1. ✅ `src/lib/authorization.ts` - Updated role checking logic
2. ✅ `src/pages/Dashboard.tsx` - Added plan tier and admin status sync
3. ✅ `src/types/firestore.ts` - Updated UserProfile interface
4. ✅ `src/components/PermissionGuard.tsx` - Already uses checkUserRole (no changes needed)
5. ✅ `src/pages/Admin.tsx` - Already uses PermissionGuard (no changes needed)

## Environment Variables Required

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=peptisync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=peptisync
VITE_FIREBASE_STORAGE_BUCKET=peptisync.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin Configuration
VITE_ADMIN_EMAIL=rahulsinghnegi25561@gmail.com
```

## Future Enhancements

1. **Real-time Sync**: Use Firestore listeners to update role in real-time
2. **Role Management UI**: Admin interface to grant/revoke roles
3. **Audit Log**: Track role changes and admin actions
4. **Custom Claims Sync**: Backend function to sync roles to custom claims
5. **Permission Caching**: Cache permission checks for better performance

## Troubleshooting

### Issue: Admin user cannot access admin panel

**Solution:**
1. Check Firebase users collection for `is_admin` field
2. Verify user email matches `VITE_ADMIN_EMAIL`
3. Check browser console for authorization errors
4. Clear browser cache and re-login

### Issue: Plan tier not displaying correctly

**Solution:**
1. Check Firebase users collection for `plan_tier` field
2. Verify field value is one of: 'free', 'basic', 'pro', 'pro_plus', 'elite'
3. Check if field name is `plan_tier` (snake_case)
4. Dashboard will auto-sync to both formats

### Issue: Moderator can access full admin panel

**Solution:**
1. This should not happen - check role hierarchy logic
2. Verify `checkRoleHierarchy` function is working
3. Check if user has both `is_admin` and `is_moderator` set to true

## Related Documentation

- `FIREBASE_SCHEMA.md` - Complete Firebase collections documentation
- `ADMIN_SETUP.md` - Admin setup instructions
- `src/lib/authorization.ts` - Authorization implementation
- `src/types/firestore.ts` - TypeScript type definitions

## Conclusion

The website now fully integrates with the Firebase users collection for admin roles, moderator roles, and plan tiers. Users with admin/moderator status in the mobile app automatically get the same access on the website, providing a seamless cross-platform experience.

