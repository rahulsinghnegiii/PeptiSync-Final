# Vercel Deployment Guide for PeptiSync

**Date:** November 13, 2025  
**Status:** ✅ READY FOR DEPLOYMENT  
**Platform:** Vercel

---

## 🚀 Quick Deployment (5 Minutes)

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect settings from `vercel.json`
5. Add environment variables (see below)
6. Click "Deploy"

---

## 📋 Pre-Deployment Checklist

### ✅ Files Ready
- [x] `vercel.json` - Configured and optimized
- [x] `.vercelignore` - Excludes unnecessary files
- [x] `package.json` - Build scripts configured
- [x] `vite.config.ts` - Production build optimized
- [x] All environment variables documented

### ✅ Code Ready
- [x] No linter errors
- [x] All routes working
- [x] Logo integrated
- [x] Memory optimizations applied
- [x] Privacy policy added
- [x] Production build tested locally

---

## 🔑 Environment Variables Setup

### ⚠️ IMPORTANT: Add These in Vercel Dashboard

**DO NOT use Vercel Secrets** - Add these as regular Environment Variables instead.

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables (Copy these exactly)

#### 1. Supabase Configuration
```
Variable Name: VITE_SUPABASE_URL
Value: https://ntcydolfuonagdtdhpot.supabase.co
Environment: Production, Preview, Development (select all)
```

```
Variable Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
Environment: Production, Preview, Development (select all)
```

#### 2. Stripe Configuration
```
Variable Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_your_key_here (⚠️ REPLACE WITH YOUR ACTUAL KEY)
Environment: Production, Preview, Development (select all)
```

**Where to find your Stripe key:**
- Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- Copy "Publishable key" (use `pk_test_` for testing)

#### 3. Application URL
```
Variable Name: VITE_APP_URL
Value: https://your-domain.vercel.app (⚠️ UPDATE AFTER FIRST DEPLOYMENT)
Environment: Production, Preview, Development (select all)
```

**Note:** After your first deployment, Vercel will give you a URL like `https://pepti-sync-final.vercel.app`. Update this variable with that URL.

#### 4. Firebase Configuration (Optional - if using Firebase features)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-app.firebaseio.com
```

---

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# 1. Ensure all changes are committed
git status

# 2. Commit any pending changes
git add .
git commit -m "Prepare for Vercel deployment"

# 3. Push to your Git repository
git push origin main
```

### Step 2: Connect to Vercel

#### Via CLI:
```bash
# Login to Vercel
vercel login

# Link your project (first time only)
vercel link

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (for new) or Yes (for existing)
# - Project name? peptisync (or your preferred name)
```

#### Via Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Vercel will auto-detect the framework (Vite)

### Step 3: Configure Environment Variables

#### Via CLI:
```bash
# Add environment variables one by one
vercel env add VITE_SUPABASE_URL production
# Paste your value when prompted

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
# Paste your value when prompted

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Paste your value when prompted

vercel env add VITE_APP_URL production
# Enter your Vercel URL
```

#### Via Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production (and Preview if needed)
3. Click "Save"
4. Repeat for all variables

### Step 4: Deploy

#### Via CLI:
```bash
# Deploy to production
vercel --prod

# Or for preview deployment
vercel
```

#### Via Dashboard:
- Push to your Git repository
- Vercel will automatically deploy
- Or click "Deploy" button in dashboard

### Step 5: Verify Deployment

1. **Check Build Logs**
   - Vercel Dashboard → Deployments → Latest Deployment → View Logs
   - Ensure no errors

2. **Test Your Site**
   - Visit your Vercel URL
   - Test all major features:
     - [ ] Homepage loads
     - [ ] Navigation works
     - [ ] Logo appears
     - [ ] Auth (login/signup)
     - [ ] Product browsing
     - [ ] Cart functionality
     - [ ] Checkout flow
     - [ ] Privacy policy page

3. **Check Console**
   - Open browser DevTools
   - Check for any errors
   - Verify API calls work

---

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Settings

Add your Vercel URL to Supabase allowed URLs:

```bash
# Go to Supabase Dashboard
# → Authentication → URL Configuration
# Add these URLs:

Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/**
  - https://your-domain.vercel.app/auth
  - https://your-domain.vercel.app/dashboard
  - https://your-domain.vercel.app/update-password
```

### 2. Update Stripe Settings

If using Stripe webhooks:

```bash
# Go to Stripe Dashboard → Developers → Webhooks
# Add endpoint:
https://your-project.supabase.co/functions/v1/create-payment-intent

# Select events:
- payment_intent.succeeded
- payment_intent.payment_failed
```

### 3. Configure Custom Domain (Optional)

```bash
# Via CLI:
vercel domains add your-domain.com

# Via Dashboard:
# → Project Settings → Domains → Add Domain
# Follow DNS configuration instructions
```

### 4. Set Up Analytics (Optional)

```bash
# Vercel Analytics is automatically enabled
# View at: Dashboard → Your Project → Analytics

# Or add Google Analytics:
# Add VITE_GA_TRACKING_ID to environment variables
```

---

## 🎯 Vercel Configuration Details

### Build Settings (from vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### Routing (SPA Configuration)

All routes redirect to `index.html` for client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Caching Strategy

- **Static Assets:** 1 year cache (immutable)
  - `/assets/*` - JS, CSS, images
  - `*.js`, `*.css`, `*.woff2`, `*.webp`, `*.jpg`, `*.png`

- **HTML:** No cache (always fresh)
  - `*.html` - `max-age=0, must-revalidate`

### Security Headers

All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 🚨 Troubleshooting

### Build Fails

**Problem:** Build fails with "out of memory" error

**Solution:**
```bash
# Increase Node memory limit in package.json:
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

### Environment Variables Not Working

**Problem:** `undefined` values for environment variables

**Solution:**
1. Ensure variables start with `VITE_` prefix
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### 404 Errors on Routes

**Problem:** Direct URL access returns 404

**Solution:**
- Verify `vercel.json` has rewrites configuration
- Ensure `outputDirectory` is set to `dist`

### Supabase Connection Fails

**Problem:** "Invalid API key" or connection errors

**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Check Supabase project is not paused
3. Verify URL is added to Supabase allowed URLs

### Images Not Loading

**Problem:** Images return 404 or don't display

**Solution:**
1. Ensure images are in `public/` directory
2. Use absolute paths: `/logo.png` not `./logo.png`
3. Check image files are committed to Git

### Stripe Payments Fail

**Problem:** Payment processing doesn't work

**Solution:**
1. Use `pk_live_` key for production (not `pk_test_`)
2. Verify Supabase Edge Functions are deployed
3. Check Stripe webhook endpoint is configured

---

## 📊 Performance Optimization

### Vercel Automatic Optimizations

Vercel automatically provides:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Brotli compression
- ✅ Image optimization (for Next.js images)
- ✅ Edge caching
- ✅ DDoS protection

### Additional Optimizations

1. **Enable Vercel Analytics**
   ```bash
   # Dashboard → Project → Analytics → Enable
   ```

2. **Set up Edge Config (Optional)**
   - For feature flags
   - For A/B testing
   - For dynamic configuration

3. **Monitor Performance**
   - Use Vercel Speed Insights
   - Check Core Web Vitals
   - Monitor error rates

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to Git:

- **Production:** Pushes to `main` branch
- **Preview:** Pushes to other branches
- **Pull Requests:** Automatic preview deployments

### Manual Deployments

```bash
# Deploy specific branch
vercel --prod --branch=your-branch

# Deploy with custom name
vercel --prod --name=peptisync-custom

# Rollback to previous deployment
vercel rollback
```

### Deployment Hooks

Set up webhooks for notifications:
```bash
# Dashboard → Project Settings → Git → Deploy Hooks
# Add webhook URL for Slack, Discord, etc.
```

---

## 📈 Monitoring & Analytics

### Vercel Dashboard

Monitor your deployment:
- **Deployments:** View all deployments and their status
- **Analytics:** Page views, top pages, visitor stats
- **Logs:** Real-time function and build logs
- **Speed Insights:** Core Web Vitals, performance metrics

### External Monitoring

Consider adding:
1. **Sentry** - Error tracking
2. **Google Analytics** - User analytics
3. **Hotjar** - Heatmaps and recordings
4. **UptimeRobot** - Uptime monitoring

---

## 💰 Pricing & Limits

### Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ⚠️ 6,000 build minutes/month
- ⚠️ 100 GB-hours serverless function execution

### Pro Plan ($20/month)
- ✅ Everything in Hobby
- ✅ Unlimited bandwidth
- ✅ Advanced analytics
- ✅ Team collaboration
- ✅ Password protection
- ✅ Priority support

**Recommendation:** Start with Hobby plan, upgrade if needed

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Site is accessible at Vercel URL
- [ ] All pages load correctly
- [ ] Logo appears everywhere
- [ ] Theme toggle works
- [ ] Authentication works (login/signup)
- [ ] Product browsing works
- [ ] Cart functionality works
- [ ] Checkout flow works
- [ ] Privacy policy accessible
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Supabase connection working
- [ ] Stripe payments working (test mode)
- [ ] Email notifications working
- [ ] Admin panel accessible
- [ ] Custom domain configured (if applicable)

---

## 📞 Support & Resources

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### PeptiSync Documentation
- [Quick Start Guide](docs/guides/QUICK_START.md)
- [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Troubleshooting](docs/troubleshooting/)

### Getting Help
- **Vercel Support:** support@vercel.com
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **PeptiSync Issues:** Check project documentation

---

## 🔐 Security Best Practices

### Before Deploying

1. **Review Environment Variables**
   - Never commit `.env` files
   - Use Vercel environment variables
   - Rotate keys regularly

2. **Check Dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Update Security Headers**
   - Already configured in `vercel.json`
   - Review and adjust as needed

4. **Enable HTTPS Only**
   - Automatic with Vercel
   - Verify no mixed content warnings

### After Deploying

1. **Monitor Logs**
   - Check for suspicious activity
   - Monitor error rates

2. **Set Up Alerts**
   - Configure Vercel notifications
   - Set up uptime monitoring

3. **Regular Updates**
   - Keep dependencies updated
   - Apply security patches promptly

---

## 🎯 Next Steps

After successful deployment:

1. **Test Thoroughly**
   - Run through all user flows
   - Test on multiple devices
   - Check different browsers

2. **Configure Custom Domain**
   - Purchase domain if needed
   - Configure DNS settings
   - Enable SSL (automatic)

3. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Add error tracking (Sentry)
   - Set up uptime monitoring

4. **Optimize Performance**
   - Review Speed Insights
   - Optimize images further
   - Enable caching strategies

5. **Marketing & SEO**
   - Submit sitemap to Google
   - Set up Google Search Console
   - Configure social media previews

---

**Deployment Date:** November 13, 2025  
**Status:** ✅ READY FOR PRODUCTION  
**Estimated Deployment Time:** 5-10 minutes  
**Confidence Level:** HIGH

**Ready to deploy!** Start with the Quick Deployment section above. 🚀

