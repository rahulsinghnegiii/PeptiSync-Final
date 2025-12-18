# Vercel Quick Start - PeptiSync

## 🚀 Deploy in 3 Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel --prod
```

---

## 🔑 Environment Variables Needed

Add these in Vercel Dashboard after deployment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_APP_URL=https://your-domain.vercel.app
```

**Where to add:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add each variable

---

## 📋 Post-Deployment Checklist

After deployment:

1. **Update Supabase**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to allowed URLs

2. **Test Your Site**
   - Visit your Vercel URL
   - Test login/signup
   - Test cart and checkout
   - Verify all pages work

3. **Update Environment Variable**
   ```bash
   # Update VITE_APP_URL with your actual Vercel URL
   # Then redeploy
   ```

---

## 🆘 Quick Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# If it works locally but fails on Vercel,
# check environment variables
```

### 404 on Routes
- Verify `vercel.json` exists
- Check rewrites configuration

### Supabase Connection Fails
- Verify environment variables are set
- Check Supabase URL is added to allowed URLs

---

## 📖 Full Documentation

See **VERCEL_DEPLOYMENT_GUIDE.md** for complete instructions.

---

## 🎯 Alternative: Deploy via Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects settings
4. Add environment variables
5. Click "Deploy"

---

**Estimated Time:** 5-10 minutes  
**Status:** ✅ Ready to Deploy

