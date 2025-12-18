# 🚀 Vercel Blank Page - Quick Reference Card

**Print this or keep it handy!**

---

## ⚡ THE 5-MINUTE FIX

### Step 1: Add Variables (2 minutes)
Go to: **https://vercel.com/dashboard** → Your Project → **Settings** → **Environment Variables**

Add these 4 variables (click "Add New" for each):

```
1. VITE_SUPABASE_URL
   https://ntcydolfuonagdtdhpot.supabase.co
   ✓ Production ✓ Preview ✓ Development

2. VITE_SUPABASE_PUBLISHABLE_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
   ✓ Production ✓ Preview ✓ Development

3. VITE_STRIPE_PUBLISHABLE_KEY
   [Get from: https://dashboard.stripe.com/test/apikeys]
   ✓ Production ✓ Preview ✓ Development

4. VITE_APP_URL
   https://your-project.vercel.app
   ✓ Production ✓ Preview ✓ Development
```

### Step 2: Redeploy (1 minute)
**Deployments** → **"..."** → **Redeploy** → **UNCHECK cache** → **Redeploy**

### Step 3: Wait & Verify (2 minutes)
Open site → Press **F12** → Check console → Should see: `[Supabase Client] Initializing...`

---

## 🔍 Quick Diagnosis

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page | Missing env vars | Add variables + redeploy |
| "Missing Supabase..." error | Env vars not set | Add to Vercel Dashboard |
| Added vars but still blank | Using cache | Redeploy WITHOUT cache |
| Works locally, fails Vercel | No .env on Vercel | Add to Dashboard |

---

## ✅ Checklist

Before asking for help, verify:

- [ ] All 4 variables added to Vercel
- [ ] Each variable checked for all 3 environments
- [ ] Variable names exact (case-sensitive)
- [ ] No extra spaces in names/values
- [ ] Redeployed WITHOUT cache
- [ ] Build completed successfully
- [ ] Tested in incognito window
- [ ] Checked browser console

---

## 🆘 Emergency Contacts

**Documentation:**
- Quick Fix: `BLANK_PAGE_QUICK_FIX.md`
- Research: `VERCEL_BLANK_PAGE_RESEARCH.md`
- Visual: `VERCEL_BLANK_PAGE_FLOWCHART.md`

**Diagnostic Tool:**
```bash
node diagnose-vercel.js
```

**Vercel Dashboard:**
https://vercel.com/dashboard

**Stripe Keys:**
https://dashboard.stripe.com/test/apikeys

---

## 💡 Remember

1. **Variables must be set BEFORE building**
2. **Always redeploy WITHOUT cache after adding variables**
3. **Check ALL THREE environments for each variable**
4. **Variable names are case-sensitive**
5. **Build success ≠ deployment success**

---

## 🎯 Success Indicators

✅ **You'll know it's fixed when:**
- Site loads (no blank page)
- Console shows: `[Supabase Client] Initializing...`
- No errors in console
- All pages accessible

---

**Confidence:** 99% | **Time:** 5 min | **Risk:** Very Low

**Last Updated:** December 18, 2025

