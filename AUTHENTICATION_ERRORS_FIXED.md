# Authentication Errors Fixed

## Issues Addressed

### 1. Invalid Credential Error ✅
**Error**: `FirebaseError: Firebase: Error (auth/invalid-credential)`

**Cause**: The email/password combination doesn't exist in Firebase Authentication. This is expected after migrating from Supabase to Firebase - your old Supabase users don't automatically transfer to Firebase.

**Solution**: 
- Added better error messages to help users understand what went wrong
- Users need to create new accounts in Firebase

### 2. MetaMask Extension Error (Can Ignore)
**Error**: `Uncaught (in promise) i: Failed to connect to MetaMask`

**Cause**: MetaMask browser extension trying to inject code into the page

**Solution**: This is not your app's error - it's from the browser extension. You can safely ignore it.

### 3. Identity Toolkit API Error
**Error**: `Failed to load resource: the server responded with a status of 400`

**Cause**: Invalid credentials being sent to Firebase Authentication API

**Solution**: Fixed with improved error handling

## Changes Made

### Updated `src/pages/Auth.tsx`

#### Sign In Error Handling
Now provides user-friendly messages for:
- ✅ Invalid credentials
- ✅ Wrong password
- ✅ User not found
- ✅ Too many attempts
- ✅ Account disabled

#### Sign Up Error Handling
Now provides user-friendly messages for:
- ✅ Email already in use
- ✅ Invalid email format
- ✅ Weak password

## How to Use the App Now

### For New Users
1. Click on **"Sign Up"** tab
2. Enter your details:
   - Full Name
   - Email
   - Password (must meet requirements)
   - Confirm Password
3. Click **"Sign Up"**
4. Check your email for verification

### For Existing Supabase Users
**Important**: Your old Supabase account credentials won't work with Firebase. You need to:

1. **Option A**: Create a new account with the same email
   - Click "Sign Up"
   - Use your email
   - Create a new password
   
2. **Option B**: Migrate your data (requires manual work)
   - Export users from Supabase
   - Import to Firebase using Admin SDK
   - Users will need to reset passwords

## Testing Authentication

### Test Sign Up
```
1. Go to /auth
2. Click "Sign Up" tab
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@# (meets requirements)
   - Confirm Password: Test123!@#
4. Click "Sign Up"
5. Check Firebase Console → Authentication
```

### Test Sign In
```
1. Use the account you just created
2. Enter email and password
3. Click "Sign In"
4. Should redirect to /dashboard
```

### Password Requirements
- ✅ At least 8 characters
- ✅ One uppercase letter
- ✅ One lowercase letter
- ✅ One number
- ✅ Optional: Special characters for stronger security

## Firebase Console Check

Verify users in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **peptisync**
3. Click **Authentication** in left menu
4. Click **Users** tab
5. You should see newly created users here

## Common Issues & Solutions

### "Invalid email or password"
- **Cause**: Account doesn't exist in Firebase
- **Solution**: Click "Sign Up" to create new account

### "Email already in use"
- **Cause**: Account already exists
- **Solution**: Use "Sign In" instead, or reset password

### "Password does not meet requirements"
- **Cause**: Password too weak
- **Solution**: Use at least 8 characters with uppercase, lowercase, and numbers

### "Too many failed login attempts"
- **Cause**: Multiple failed login attempts
- **Solution**: Wait 15-30 minutes or reset password

## Email Verification

Firebase sends verification emails automatically:
- Check your inbox after signing up
- Click the verification link
- Email verification is required for full access

## Next Steps

1. ✅ Create your first Firebase account
2. ✅ Test sign in/sign out
3. ✅ Verify email works
4. Set up admin roles (see FIREBASE_QUICK_START.md)
5. Test all features with new account

## Migration Notes

### If You Need to Migrate Existing Users

**Using Firebase Admin SDK**:
```javascript
const admin = require('firebase-admin');

// Export from Supabase
const supabaseUsers = [
  { email: 'user@example.com', password: 'hashed_password' }
];

// Import to Firebase
for (const user of supabaseUsers) {
  await admin.auth().createUser({
    email: user.email,
    emailVerified: false,
    password: generateTemporaryPassword(), // Users will need to reset
  });
}
```

**Note**: Passwords can't be migrated directly due to different hashing algorithms. Users will need to reset passwords.

## Support

If you continue to see authentication errors:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Check Firebase Console for any service issues
4. Verify environment variables are set correctly

---

**Status**: ✅ Authentication errors fixed with better error handling
**Action Required**: Create new Firebase account to test

