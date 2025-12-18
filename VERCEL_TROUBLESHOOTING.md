# 🔧 Vercel Deployment Troubleshooting

## Current Error Analysis

### Error: `Uncaught TypeError: Cannot read properties of undefined (reading 'createContext')`

**What this means:** React is not loading properly on your Vercel deployment.

### Root Cause
The most likely cause is **missing environment variables**. When environment variables are missing, the Supabase client fails to initialize, which can cause the entire app to fail loading.

---

## ✅ IMMEDIATE FIX - Add Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your **PeptiSync** project
3. Click **Settings** → **Environment Variables**

### Step 2: Add These 4 Variables

Copy and paste these EXACTLY:

#### Variable 1:
```
Name: VITE_SUPABASE_URL
Value: https://ntcydolfuonagdtdhpot.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variable 2:
```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variable 3:
```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_YOUR_ACTUAL_KEY_HERE
Environments: ✓ Production ✓ Preview ✓ Development
```
⚠️ **Get your Stripe key from:** https://dashboard.stripe.com/test/apikeys

#### Variable 4:
```
Name: VITE_APP_URL
Value: https://peptisync.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development
```
⚠️ **Replace with your actual Vercel URL**

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Select **"Use existing Build Cache"** → NO (uncheck it)
5. Click **"Redeploy"**

---

## 🔍 Other Potential Issues

### Issue 2: Runtime Errors (Message Port Closed)
The errors about "message port closed" are less critical - they're related to browser extensions or dev tools. They won't prevent the app from working once React loads.

### Issue 3: Build vs Runtime
- ✅ **Build succeeded** (we tested locally)
- ❌ **Runtime failing** (React not loading)
- **Cause:** Missing environment variables at runtime

---

## ✅ Verification Checklist

After redeploying, check:

1. **Open the site** → https://peptisync.vercel.app
2. **Open DevTools Console** (F12)
3. **Check for errors:**
   - ❌ If you still see "Cannot read properties of undefined" → Environment variables not set correctly
   - ✅ If you see the PeptiSync homepage → SUCCESS!

4. **Test Supabase connection:**
   - Try to sign up or sign in
   - If it works → Environment variables are correct

---

## 🆘 Still Not Working?

### Double-check Environment Variables
Run this in Vercel CLI:
```bash
vercel env ls
```

Should show:
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_APP_URL
```

### Force Fresh Build
```bash
vercel --prod --force
```

### Check Build Logs
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check the **Build Logs** tab
4. Look for any errors about missing variables

---

## 📞 Quick Reference

**Your Supabase Project:** https://ntcydolfuonagdtdhpot.supabase.co  
**Your Vercel Project:** https://vercel.com/dashboard  
**Stripe Dashboard:** https://dashboard.stripe.com/test/apikeys

---

**Last Updated:** December 18, 2025

