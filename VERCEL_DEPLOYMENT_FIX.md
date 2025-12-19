# Vercel Deployment Fix - Supabase Dependency

**Date:** December 19, 2024  
**Status:** ✅ Fixed

## Problem

Vercel deployment was failing with the following error:

```
[vite]: Rollup failed to resolve import "@supabase/supabase-js" from "/vercel/path0/src/integrations/supabase/client.ts".
```

## Root Cause

The `@supabase/supabase-js` package was not listed in the `package.json` dependencies, but the codebase still had imports from it in several files:

- `src/integrations/supabase/client.ts`
- `src/lib/queryPerformance.ts`
- `src/lib/securityUtils.ts`
- `src/lib/email.ts`
- `src/components/settings/SecurityTab.tsx`

## Solution

Added `@supabase/supabase-js` to the dependencies in `package.json`:

```json
"dependencies": {
  "@supabase/supabase-js": "^2.47.10",
  // ... other dependencies
}
```

## Why This Happened

The project was migrated from Supabase to Firebase for primary data storage, but some legacy Supabase code remained:

1. **Email functionality** - Uses Supabase Edge Functions
2. **Security utilities** - Some security features still reference Supabase
3. **Client initialization** - Supabase client is still initialized with fallback values

The Supabase client is configured with fallback values and warnings to handle the migration gracefully:

```typescript
// From src/integrations/supabase/client.ts
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('[Supabase Client] Using fallback values - Supabase features will not work (expected during Firebase migration)');
}
```

## Files Modified

**`package.json`**
- Added `@supabase/supabase-js": "^2.47.10"` to dependencies

## Testing

✅ Local build successful  
✅ No TypeScript errors  
✅ No import resolution errors  
✅ Ready for Vercel deployment  

## Deployment Steps

1. Commit the updated `package.json`
2. Push to repository
3. Vercel will automatically:
   - Install `@supabase/supabase-js`
   - Build successfully
   - Deploy the application

## Environment Variables

Ensure these are set in Vercel:

### Firebase (Primary)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=peptisync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=peptisync
VITE_FIREBASE_STORAGE_BUCKET=peptisync.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=rahulsinghnegi25561@gmail.com
```

### Supabase (Optional - Legacy)
```
VITE_SUPABASE_URL=your_supabase_url (optional)
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key (optional)
```

**Note:** Supabase env vars are optional. The app will use fallback values if not provided.

## Future Cleanup (Optional)

To fully remove Supabase dependency in the future:

1. **Remove Supabase email functions** - Migrate to Firebase Cloud Functions or another email service
2. **Update security utilities** - Remove Supabase-specific security code
3. **Remove Supabase client** - Delete `src/integrations/supabase/` directory
4. **Remove package** - Remove `@supabase/supabase-js` from dependencies

This is not urgent since the current setup works with fallback values.

## Alternative Solution (Not Recommended)

If you wanted to completely remove Supabase, you would need to:

1. Refactor email sending to use a different service
2. Update security utilities
3. Remove all Supabase imports
4. Remove the package from dependencies

However, this would require significant code changes and is not necessary for deployment.

## Conclusion

The deployment error has been fixed by adding the missing `@supabase/supabase-js` dependency. The application will now build successfully on Vercel.

The Supabase client is configured with fallback values, so the app works even without Supabase credentials. This allows for a gradual migration from Supabase to Firebase without breaking the deployment.

✅ **Deployment Ready!**

