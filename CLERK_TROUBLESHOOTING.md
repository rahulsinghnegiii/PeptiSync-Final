# Clerk Integration Troubleshooting Guide

## Issue: Clerk API Keys Not Working

### Problem
You've added Clerk API keys but they're not being recognized by the application.

### Root Cause
This is a **Vite project**, not a Next.js project. Vite uses different environment variable naming conventions.

### Solution

#### ❌ Wrong (Next.js naming):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### ✅ Correct (Vite naming):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Key Differences

| Framework | Public Variables | Private Variables |
|-----------|-----------------|-------------------|
| **Vite** | `VITE_*` | No prefix (server-only) |
| **Next.js** | `NEXT_PUBLIC_*` | No prefix (server-only) |

### Steps to Fix

1. **Update your `.env` file**:
   ```env
   # ✅ Correct for Vite
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWF4aW11bS1nbnUtMzYuY2xlcmsuYWNjb3VudHMuZGV2JA
   
   # Backend secrets (no VITE_ prefix - these are server-only)
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

2. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. **Verify the keys are loaded**:
   - Open browser console
   - Type: `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`
   - Should show your key (not undefined)

### Environment Variable Rules for Vite

#### ✅ Exposed to Browser (use `VITE_` prefix):
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_APP_URL` - Application URL

#### ❌ Server-Only (NO prefix):
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Webhook signing secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `RESEND_API_KEY` - Email service key

### Common Errors

#### Error: "Clerk publishable key is not configured"
**Cause**: Missing or incorrectly named environment variable

**Fix**:
1. Check `.env` file has `VITE_CLERK_PUBLISHABLE_KEY`
2. Restart dev server
3. Clear browser cache

#### Error: "ClerkProvider" not found
**Cause**: Package not installed

**Fix**:
```bash
npm install @clerk/clerk-react
```

#### Error: Clerk UI not showing
**Cause**: CSS not loaded or configuration issue

**Fix**:
1. Check browser console for errors
2. Verify Clerk publishable key is correct
3. Check network tab for failed requests

### Verification Checklist

- [ ] Environment variables use `VITE_` prefix for public keys
- [ ] `.env` file is in project root (same level as `package.json`)
- [ ] Development server has been restarted after changing `.env`
- [ ] Browser cache has been cleared
- [ ] Clerk publishable key starts with `pk_test_` or `pk_live_`
- [ ] No typos in environment variable names

### Testing Your Setup

1. **Check environment variables are loaded**:
   ```typescript
   // In browser console
   console.log(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
   // Should output: pk_test_...
   ```

2. **Visit sign-in page**:
   ```
   http://localhost:5173/sign-in
   ```
   - Should see Clerk sign-in form
   - No configuration errors

3. **Try to sign up**:
   - Create a test account
   - Should receive verification email
   - Check Clerk Dashboard for new user

### Still Having Issues?

1. **Check Clerk Dashboard**:
   - Go to https://dashboard.clerk.com
   - Verify your API keys are correct
   - Check if your domain is allowed

2. **Check Browser Console**:
   - Look for error messages
   - Check network tab for failed requests

3. **Verify Package Installation**:
   ```bash
   npm list @clerk/clerk-react
   # Should show version number
   ```

4. **Check Vite Config**:
   - Ensure no custom env variable handling
   - Default Vite config should work

### Quick Fix Script

If you're still having issues, try this:

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clear node modules and reinstall
rm -rf node_modules
npm install

# 3. Verify environment variables
cat .env | grep VITE_CLERK

# 4. Restart dev server
npm run dev
```

### Environment File Priority

Vite loads environment files in this order (later files override earlier):

1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases, ignored by git
3. `.env.[mode]` - Only loaded in specified mode (e.g., `.env.production`)
4. `.env.[mode].local` - Only loaded in specified mode, ignored by git

**Recommendation**: Use `.env.local` for local development secrets.

### Need More Help?

- **Clerk Documentation**: https://clerk.com/docs
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Project Setup Guide**: `.kiro/specs/clerk-migration/SETUP_GUIDE.md`

---

## Summary

**The main issue**: Using `NEXT_PUBLIC_*` instead of `VITE_*` for environment variables.

**The fix**: Rename all public environment variables to use `VITE_` prefix and restart your dev server.

Your Clerk keys are correct, they just need the right naming convention! 🎉
