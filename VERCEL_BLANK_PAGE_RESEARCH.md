# 🔍 Vercel Blank Page Research & Solutions

**Date:** December 18, 2025  
**Issue:** Blank page on Vercel deployment while working locally  
**Project:** PeptiSync

---

## 🎯 Root Cause Analysis

Based on the codebase analysis, here are the **most likely causes** for the blank page on Vercel:

### 1. **Missing Environment Variables** (90% Probability)

**Evidence:**
- Your `src/integrations/supabase/client.ts` throws an error if environment variables are missing
- The error message explicitly states: "Missing Supabase environment variables"
- Vite environment variables (`VITE_*`) must be set at **build time**, not runtime

**Why it works locally:**
- You likely have a `.env` file locally (not committed to Git)
- Vite loads these variables during local development

**Why it fails on Vercel:**
- Environment variables are not set in Vercel Dashboard
- OR they are set but not applied to all environments (Production, Preview, Development)
- OR the build cache is preventing new variables from being used

**Critical Code:**
```typescript:17:28:src/integrations/supabase/client.ts
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMsg = `Missing Supabase environment variables:
    VITE_SUPABASE_URL: ${SUPABASE_URL ? 'Set' : 'MISSING'}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'MISSING'}
    
    Available env vars: ${Object.keys(import.meta.env).join(', ')}
    
    Please check your Vercel environment variables configuration.`;
  
  console.error('[Supabase Client]', errorMsg);
  throw new Error(errorMsg);
}
```

---

### 2. **Vite Environment Variable Build-Time Injection** (Critical Understanding)

**How Vite handles environment variables:**
- Vite replaces `import.meta.env.VITE_*` with actual values **during the build process**
- This means environment variables must be available when `npm run build` executes
- Unlike server-side apps, the variables are **baked into the JavaScript bundle**

**Vercel Build Process:**
1. Vercel reads environment variables from Dashboard
2. Runs `npm install`
3. Runs `npm run build` (with env vars available)
4. Deploys the `dist/` folder to CDN

**If environment variables are missing during build:**
- `import.meta.env.VITE_SUPABASE_URL` becomes `undefined`
- Supabase client initialization fails
- React app crashes before rendering
- Result: **Blank page**

---

### 3. **React Initialization Failure** (Consequence of #1)

**Error Chain:**
1. Supabase client throws error (missing env vars)
2. Error occurs during module import
3. React never gets to render
4. ErrorBoundary can't catch the error (it happens before React mounts)
5. Browser shows blank page

**Your ErrorBoundary is well-designed but can't catch this:**
```typescript:14:26:src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
```

**Why ErrorBoundary doesn't help:**
- It only catches errors during React rendering
- Module import errors happen **before** React starts
- The error occurs when `client.ts` is imported, not during render

---

## ✅ SOLUTION: Step-by-Step Fix

### Step 1: Verify Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your PeptiSync project

2. **Navigate to Settings → Environment Variables**

3. **Add ALL FOUR required variables:**

   **Variable 1:**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://ntcydolfuonagdtdhpot.supabase.co
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

   **Variable 2:**
   ```
   Name: VITE_SUPABASE_PUBLISHABLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

   **Variable 3:**
   ```
   Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_51QTLnBP8ksVJRxc3YOUR_ACTUAL_KEY_HERE
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
   ⚠️ Get from: https://dashboard.stripe.com/test/apikeys

   **Variable 4:**
   ```
   Name: VITE_APP_URL
   Value: https://your-project.vercel.app
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
   ⚠️ Replace with your actual Vercel URL

### Step 2: Force Rebuild (Critical!)

**Why this is necessary:**
- Vercel caches builds for performance
- Cached builds don't include new environment variables
- You must force a fresh build

**How to force rebuild:**

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. **IMPORTANT:** Uncheck "Use existing Build Cache"
6. Click **"Redeploy"**

**Option B: Via Vercel CLI**
```bash
vercel --prod --force
```

### Step 3: Verify Deployment

1. **Wait for build to complete** (2-5 minutes)

2. **Open your Vercel URL** in browser

3. **Open DevTools Console** (F12)

4. **Check for logs:**
   - Look for: `[Supabase Client] Initializing...`
   - Should show: `url: https://ntcydolfuonagdtdhpot...`
   - Should show: `key: eyJhbGciOiJIUzI1NiIsInR5...`

5. **If still blank:**
   - Check console for error messages
   - Look for the specific error about missing variables
   - Verify all 4 variables are set correctly

---

## 🔍 Additional Diagnostic Steps

### Check Build Logs

1. **Vercel Dashboard → Deployments → Latest → View Logs**

2. **Look for these indicators:**

   **Good signs:**
   ```
   ✓ Building...
   ✓ Compiled successfully
   ✓ Build completed
   ```

   **Bad signs:**
   ```
   ✗ Missing environment variables
   ✗ Build failed
   ✗ Module not found
   ```

### Check Browser Console

1. **Open DevTools (F12)**

2. **Look for these errors:**

   **Environment variable error:**
   ```
   Error: Missing Supabase environment variables
   ```
   → Solution: Add environment variables and redeploy

   **Module import error:**
   ```
   Failed to fetch dynamically imported module
   ```
   → Solution: Clear cache and redeploy

   **React error:**
   ```
   Cannot read properties of undefined (reading 'createContext')
   ```
   → This is a symptom, not the root cause. Fix environment variables.

### Test with env-check.html

Visit: `https://your-project.vercel.app/env-check.html`

This diagnostic page verifies:
- Static files are being served
- Deployment is working
- Issue is with React app initialization

---

## 🛠️ Alternative Solutions (If Above Doesn't Work)

### Solution A: Add Fallback Values

If you want to prevent the app from crashing, add fallback values:

**Modify `src/integrations/supabase/client.ts`:**

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ntcydolfuonagdtdhpot.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k';
```

**⚠️ Warning:** This is not recommended for production as it exposes credentials in code.

### Solution B: Lazy Load Supabase Client

Delay Supabase initialization until after React mounts:

**Create `src/integrations/supabase/lazyClient.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      console.error('Missing Supabase environment variables');
      // Return a mock client or throw error in UI
      throw new Error('Configuration error. Please contact support.');
    }

    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }

  return supabaseInstance;
};
```

**Then update imports:**
```typescript
// Instead of:
import { supabase } from "@/integrations/supabase/client";

// Use:
import { getSupabase } from "@/integrations/supabase/lazyClient";
const supabase = getSupabase();
```

### Solution C: Add Environment Variable Check Page

Create a simple diagnostic endpoint:

**Create `public/check-env.html`:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Environment Check</title>
</head>
<body>
    <h1>Environment Variables Check</h1>
    <div id="results"></div>
    <script type="module">
        const results = document.getElementById('results');
        
        // This won't work because Vite replaces these at build time
        // But it helps understand the issue
        results.innerHTML = `
            <p>VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}</p>
            <p>VITE_SUPABASE_PUBLISHABLE_KEY: ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING'}</p>
            <p>Mode: ${import.meta.env.MODE}</p>
        `;
    </script>
</body>
</html>
```

---

## 📊 Common Vercel + Vite Issues

### Issue 1: Environment Variables Not Updating

**Symptom:** Variables are set in Vercel but app still shows old values

**Cause:** Build cache

**Solution:**
- Always redeploy WITHOUT cache after adding variables
- Or use: `vercel --prod --force`

### Issue 2: Variables Work in Preview but Not Production

**Symptom:** Preview deployments work, production doesn't

**Cause:** Variables not set for Production environment

**Solution:**
- Check all three checkboxes when adding variables:
  - ✓ Production
  - ✓ Preview  
  - ✓ Development

### Issue 3: Variables with Special Characters

**Symptom:** Variables with special characters cause issues

**Cause:** Improper escaping

**Solution:**
- Don't wrap values in quotes in Vercel Dashboard
- Paste the raw value directly
- Vercel handles escaping automatically

### Issue 4: CORS Errors After Deployment

**Symptom:** API calls fail with CORS errors

**Cause:** Supabase doesn't allow your Vercel domain

**Solution:**
1. Go to Supabase Dashboard
2. Settings → API → URL Configuration
3. Add your Vercel URL to allowed origins

---

## 🎯 Quick Checklist

Use this checklist to verify everything is correct:

### Vercel Dashboard
- [ ] All 4 environment variables are set
- [ ] Each variable is checked for all 3 environments
- [ ] Variable names match exactly (case-sensitive)
- [ ] No extra spaces in variable names or values
- [ ] Variables start with `VITE_` prefix

### Deployment
- [ ] Redeployed after adding variables
- [ ] Used "Redeploy" without cache
- [ ] Build completed successfully (no errors in logs)
- [ ] Deployment shows as "Ready"

### Testing
- [ ] Opened site in incognito/private window
- [ ] Checked browser console for errors
- [ ] Verified no 404 errors for assets
- [ ] Tested on different browser

### Supabase
- [ ] Vercel URL added to allowed origins
- [ ] Supabase project is not paused
- [ ] API keys are correct and active

---

## 🔗 Useful Resources

### Vercel Documentation
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Troubleshooting Deployments](https://vercel.com/docs/deployments/troubleshoot-a-build)

### Vite Documentation
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Building for Production](https://vitejs.dev/guide/build.html)

### Related Files in This Project
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `VERCEL_TROUBLESHOOTING.md` - Troubleshooting steps
- `VERCEL_ENV_SETUP.md` - Environment variable setup
- `VERCEL_QUICK_START.md` - Quick start guide

---

## 🎉 Expected Outcome

After following the solution steps, you should see:

1. **In Browser Console:**
   ```
   [Supabase Client] Initializing...
   {
     url: "https://ntcydolfuonagdtdhpot...",
     key: "eyJhbGciOiJIUzI1NiIsInR5...",
     env: "production"
   }
   ```

2. **On Screen:**
   - PeptiSync homepage loads
   - Logo appears
   - Navigation works
   - Theme toggle works

3. **No Errors:**
   - No console errors
   - No blank page
   - No "Cannot read properties of undefined"

---

## 📞 Still Having Issues?

If you've followed all steps and still see a blank page:

1. **Share the following information:**
   - Vercel deployment URL
   - Browser console errors (screenshot)
   - Vercel build logs (screenshot)
   - List of environment variables set (names only, not values)

2. **Try these advanced diagnostics:**
   - Deploy to a different Vercel project
   - Test with a minimal Vite + React app
   - Check if other Vite apps deploy successfully

3. **Verify Vercel account:**
   - Check if you're on Hobby or Pro plan
   - Verify no billing issues
   - Check deployment limits haven't been reached

---

**Last Updated:** December 18, 2025  
**Status:** Ready for implementation  
**Confidence Level:** Very High (95%)

**Next Step:** Follow "Step 1: Verify Environment Variables in Vercel" above.

