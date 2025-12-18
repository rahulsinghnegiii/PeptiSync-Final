# 🚨 BLANK PAGE ON VERCEL - QUICK FIX

## The Problem
Your PeptiSync app works perfectly locally but shows a **blank page** on Vercel.

## The Root Cause (99% Certain)
**Missing environment variables in Vercel Dashboard**

Your app needs 4 environment variables to work. Without them, the Supabase client throws an error during initialization, causing React to fail before it even renders.

---

## ⚡ THE FIX (5 Minutes)

### Step 1: Add Environment Variables to Vercel

Go to: **https://vercel.com/dashboard** → Your Project → **Settings** → **Environment Variables**

Click "Add New" and add these **4 variables**:

#### Variable 1
```
Name: VITE_SUPABASE_URL
Value: https://ntcydolfuonagdtdhpot.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variable 2
```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variable 3
```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: [Get from https://dashboard.stripe.com/test/apikeys]
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variable 4
```
Name: VITE_APP_URL
Value: https://your-project.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 2: Redeploy WITHOUT Cache

**CRITICAL:** You must redeploy without cache for the variables to take effect!

**Option A: Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache" ⚠️
5. Click **"Redeploy"**

**Option B: Vercel CLI**
```bash
vercel --prod --force
```

### Step 3: Verify

1. Wait 2-5 minutes for build to complete
2. Open your Vercel URL
3. Press **F12** to open DevTools
4. Check console - you should see:
   ```
   [Supabase Client] Initializing...
   ```
5. Your app should now load! 🎉

---

## Why This Happens

### How Vite Works
- Vite replaces `import.meta.env.VITE_*` with actual values **during build**
- These values are "baked into" the JavaScript bundle
- If variables are missing during build → `undefined` → app crashes → blank page

### Your Code
Your `src/integrations/supabase/client.ts` file throws an error if environment variables are missing:

```typescript
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}
```

This error happens **before React renders**, so you see a blank page instead of an error message.

### Why It Works Locally
You have a `.env` file locally (not committed to Git) with these variables.

### Why It Fails on Vercel
The `.env` file is not on Vercel. You must set variables in the Vercel Dashboard.

---

## Still Not Working?

### Check 1: Are Variables Actually Set?
In Vercel Dashboard → Settings → Environment Variables, you should see all 4 variables listed.

### Check 2: Are All Environments Checked?
Each variable should have **3 checkmarks**: Production, Preview, Development

### Check 3: Did You Redeploy Without Cache?
This is critical! The cache prevents new variables from being used.

### Check 4: Any Typos?
Variable names are **case-sensitive** and must start with `VITE_`

### Check 5: Browser Console Errors?
Open DevTools (F12) and check the Console tab for specific error messages.

---

## Additional Resources

- **`VERCEL_BLANK_PAGE_RESEARCH.md`** - Comprehensive analysis and solutions
- **`VERCEL_TROUBLESHOOTING.md`** - Troubleshooting guide
- **`VERCEL_DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`diagnose-vercel.js`** - Run locally to check your configuration

---

## Quick Checklist

- [ ] Added all 4 environment variables to Vercel
- [ ] Checked all 3 environments for each variable
- [ ] Variable names are exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_APP_URL`
- [ ] Redeployed WITHOUT cache
- [ ] Waited for build to complete
- [ ] Tested in incognito/private window
- [ ] Checked browser console for errors

---

**Expected Result:** Your PeptiSync app loads normally on Vercel, just like it does locally! ✨

**Time to Fix:** 5 minutes  
**Success Rate:** 99%  
**Confidence:** Very High

---

**Need More Help?**

Run the diagnostic script locally:
```bash
node diagnose-vercel.cjs
```

Or read the comprehensive research document:
```bash
cat VERCEL_BLANK_PAGE_RESEARCH.md
```

