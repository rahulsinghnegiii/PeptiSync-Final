# 🔑 Vercel Environment Variables - Quick Setup

## Where to Add These
**Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## ✅ Copy & Paste These Exact Values

### 1️⃣ VITE_SUPABASE_URL
```
https://ntcydolfuonagdtdhpot.supabase.co
```
✓ Select: Production, Preview, Development

---

### 2️⃣ VITE_SUPABASE_PUBLISHABLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
```
✓ Select: Production, Preview, Development

---

### 3️⃣ VITE_STRIPE_PUBLISHABLE_KEY
```
pk_test_YOUR_ACTUAL_STRIPE_KEY_HERE
```
⚠️ **ACTION REQUIRED:** Get your key from https://dashboard.stripe.com/test/apikeys

✓ Select: Production, Preview, Development

---

### 4️⃣ VITE_APP_URL
```
https://your-project-name.vercel.app
```
⚠️ **ACTION REQUIRED:** Update this AFTER your first deployment with your actual Vercel URL

✓ Select: Production, Preview, Development

---

## 📝 Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your PeptiSync project (or import it first)

2. **Navigate to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Each Variable**
   - Click "Add New" button
   - Enter the variable name (e.g., `VITE_SUPABASE_URL`)
   - Paste the value
   - Select all three environments: Production, Preview, Development
   - Click "Save"

4. **Repeat for All 4 Variables**

5. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." menu on the latest deployment
   - Click "Redeploy"

---

## ✅ Verification

After deployment, check your browser console:
- No errors about missing environment variables
- Supabase connection works
- Stripe checkout loads

---

## 🆘 Troubleshooting

**Error: "Environment Variable VITE_SUPABASE_URL references Secret vite_supabase_url"**
- ✅ FIXED: We removed the secret references from `vercel.json`
- Just add the variables as regular environment variables (not secrets)

**Error: "Cannot read properties of undefined"**
- Check that variable names are EXACT (case-sensitive)
- Make sure you selected all three environments
- Redeploy after adding variables

---

## 🔒 Security Notes

- ✅ These are **public/publishable** keys - safe to use in frontend
- ❌ NEVER commit your `.env` file to Git
- ✅ `.env` is already in `.gitignore`
- 🔄 Rotate your Stripe key if it was exposed in the previous commit

---

**Last Updated:** December 18, 2025

