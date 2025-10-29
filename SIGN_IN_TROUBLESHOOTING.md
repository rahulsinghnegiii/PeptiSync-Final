# Sign-In Troubleshooting Guide

## Issue: Unable to Sign In

### Possible Causes:

1. **Environment Variables Not Set in Render**
2. **Database Tables Don't Exist**
3. **No User Account Created**
4. **Supabase Auth Not Configured**

---

## ✅ Step 1: Verify Environment Variables in Render

Go to your Render dashboard and ensure these variables are set:

```
VITE_SUPABASE_URL=https://ntcydolfuonagdtdhpot.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
NODE_ENV=production
```

**How to check:**
1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Verify all VITE_ variables are set

---

## ✅ Step 2: Verify Database Tables Exist

The database needs these tables:
- `profiles`
- `user_roles`
- `products`
- `orders`
- `order_items`
- `cart_items`
- `reviews`

**How to check:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `ntcydolfuonagdtdhpot`
3. Go to "Table Editor"
4. Verify all tables exist

**If tables don't exist, run migrations:**
```bash
npx supabase db push
```

---

## ✅ Step 3: Create a Test User Account

### Option A: Sign Up Through the App
1. Go to your deployed app
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test123! (must meet requirements)
   - Confirm Password: Test123!
4. Click "Create Account"

### Option B: Create User in Supabase Dashboard
1. Go to Supabase Dashboard
2. Go to "Authentication" → "Users"
3. Click "Add User"
4. Enter email and password
5. Click "Create User"

---

## ✅ Step 4: Verify Supabase Auth Configuration

### Check Auth Settings:
1. Go to Supabase Dashboard → Authentication → Settings
2. Verify:
   - **Site URL:** Should be your Render URL
   - **Redirect URLs:** Should include:
     - `https://your-app.onrender.com/auth`
     - `https://your-app.onrender.com/dashboard`
   - **Email Auth:** Should be enabled
   - **Email Confirmations:** Can be disabled for testing

### Update Site URL:
```
Site URL: https://peptisync-final.onrender.com
```

### Add Redirect URLs:
```
https://peptisync-final.onrender.com/auth
https://peptisync-final.onrender.com/dashboard
https://peptisync-final.onrender.com/update-password
```

---

## ✅ Step 5: Check Browser Console for Errors

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Try to sign in
4. Look for errors like:
   - `Failed to fetch` → Environment variables not set
   - `Invalid API key` → Wrong Supabase key
   - `Table not found` → Database migrations not applied
   - `Invalid login credentials` → Wrong email/password

---

## ✅ Step 6: Test Locally First

Before testing on Render, test locally:

1. **Update local .env file:**
```bash
VITE_SUPABASE_URL=https://ntcydolfuonagdtdhpot.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
```

2. **Run dev server:**
```bash
npm run dev
```

3. **Test sign-up:**
   - Go to http://localhost:8080/auth
   - Create a new account
   - Check if it works

4. **Test sign-in:**
   - Use the account you just created
   - Try to sign in
   - Should redirect to dashboard

---

## ✅ Step 7: Common Error Messages

### "Invalid login credentials"
- **Cause:** Wrong email or password
- **Solution:** 
  - Double-check email and password
  - Try "Forgot password?" link
  - Create a new account

### "Failed to fetch"
- **Cause:** Environment variables not set or wrong Supabase URL
- **Solution:**
  - Verify VITE_SUPABASE_URL in Render
  - Check Supabase project is active

### "Email not confirmed"
- **Cause:** Email verification required
- **Solution:**
  - Check email for verification link
  - OR disable email confirmation in Supabase:
    - Dashboard → Authentication → Settings
    - Uncheck "Enable email confirmations"

### "User already registered"
- **Cause:** Email already exists
- **Solution:**
  - Use "Sign In" instead of "Sign Up"
  - OR use a different email

---

## ✅ Step 8: Quick Test Commands

### Test Supabase Connection:
```bash
# In browser console on your deployed site
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
```

Should show your Supabase URL and key (not undefined)

### Test Auth:
```javascript
// In browser console
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'Test123!'
})
console.log({ data, error })
```

---

## 🔧 Quick Fix Checklist

- [ ] Environment variables set in Render
- [ ] Database migrations applied
- [ ] Test user account created
- [ ] Supabase Auth configured with correct URLs
- [ ] Email confirmation disabled (for testing)
- [ ] Browser console shows no errors
- [ ] Local testing works
- [ ] Deployed site can access Supabase

---

## 📞 Still Having Issues?

### Check These:

1. **Render Deployment Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for build errors or runtime errors

2. **Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Check for authentication errors

3. **Network Tab:**
   - Open DevTools → Network tab
   - Try to sign in
   - Look for failed requests to Supabase

---

## 🎯 Most Common Solution

**90% of sign-in issues are caused by:**
1. Environment variables not set in Render
2. No user account created yet

**Quick fix:**
1. Set environment variables in Render
2. Redeploy
3. Create a new account through sign-up
4. Then try to sign in

---

**Last Updated:** October 16, 2025  
**Supabase Project:** ntcydolfuonagdtdhpot  
**Render Service:** peptisync-final
