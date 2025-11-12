# PeptiSync Nova - Deployment Guide

This guide provides step-by-step instructions for deploying the PeptiSync e-commerce platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deploy to Vercel](#deploy-to-vercel)
5. [Deploy to Render](#deploy-to-render)
6. [Deploy to Netlify](#deploy-to-netlify)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ A Supabase account and project
- ✅ A Stripe account (test and production keys)
- ✅ A Resend account for email service
- ✅ Git repository with your code

---

## Environment Setup

### 1. Create Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

#### Frontend Variables (Add to deployment platform)

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
VITE_APP_URL=https://your-domain.com
```

#### Backend Variables (Supabase Secrets)

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-id

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_stripe_secret
supabase secrets set RESEND_API_KEY=re_your_resend_key
supabase secrets set VITE_APP_URL=https://your-domain.com
```

---

## Database Setup

### 1. Apply Migrations

```bash
# Push all migrations to your Supabase project
supabase db push
```

### 2. Create Storage Buckets

Via Supabase Dashboard:
1. Go to **Storage** section
2. Create the following buckets:
   - `avatars` (Public)
   - `products` (Public)
   - `documents` (Private)

Or via CLI:
```bash
supabase storage create avatars --public
supabase storage create products --public
supabase storage create documents
```

### 3. Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy create-payment-intent
supabase functions deploy send-email
supabase functions deploy check-permissions
```

### 4. Verify Database Setup

Run the verification script in Supabase SQL Editor:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

---

## Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all `VITE_*` variables from `.env.example`
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_APP_URL

# Deploy to production
vercel --prod
```

### Vercel Configuration

The `vercel.json` file is already configured with:
- ✅ SPA routing (all routes → index.html)
- ✅ Cache headers for static assets
- ✅ Security headers
- ✅ Proper MIME types

---

## Deploy to Render

### Option 1: Via Render Dashboard

1. **Create New Static Site**
   - Go to [render.com](https://render.com)
   - Click "New" → "Static Site"
   - Connect your Git repository

2. **Configure Build Settings**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all `VITE_*` variables

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete

### Option 2: Via render.yaml (Infrastructure as Code)

The `render.yaml` file is already configured. Simply:

1. Push `render.yaml` to your repository
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Select your repository
5. Render will automatically detect and use `render.yaml`

---

## Deploy to Netlify

### Option 1: Via Netlify Dashboard

1. **Import Project**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all `VITE_*` variables

4. **Deploy**
   - Click "Deploy site"

### Option 2: Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Netlify Configuration

The `netlify.toml` file is already configured with:
- ✅ SPA routing
- ✅ Cache headers
- ✅ Security headers

---

## Post-Deployment

### 1. Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### 2. Update Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project-id.supabase.co/functions/v1/create-payment-intent`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. Verify Email Domain (Resend)

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records as instructed
4. Verify domain

### 4. Test Production Deployment

- ✅ User registration and login
- ✅ Product browsing and search
- ✅ Add to cart functionality
- ✅ Checkout flow with test payment
- ✅ Order confirmation email
- ✅ Admin panel access
- ✅ Image uploads
- ✅ Mobile responsiveness

### 5. Enable Production Mode

Update environment variables:
```env
# Use production Stripe keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Update app URL
VITE_APP_URL=https://your-domain.com
```

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue**: App shows "undefined" for env vars
- Ensure all variables start with `VITE_`
- Redeploy after adding variables
- Check variable names match exactly

### Supabase Connection Issues

**Issue**: "Invalid API key" or connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Check Supabase project is not paused
- Verify RLS policies are enabled

### Stripe Payment Fails

**Issue**: Payment doesn't process
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is correct
- Verify Edge Function `create-payment-intent` is deployed
- Check `STRIPE_SECRET_KEY` is set in Supabase secrets
- Test with Stripe test cards: `4242 4242 4242 4242`

### Email Not Sending

**Issue**: Welcome/order emails not received
- Verify `RESEND_API_KEY` is set in Supabase secrets
- Check Edge Function `send-email` is deployed
- Verify domain in Resend (for production)
- Check spam folder

### Images Not Loading

**Issue**: Product/avatar images don't display
- Verify storage buckets are created
- Check bucket permissions (public for avatars/products)
- Verify image URLs in database

---

## Performance Optimization

### Enable CDN

All platforms (Vercel, Render, Netlify) provide automatic CDN. Ensure:
- Static assets are in `/assets` folder
- Cache headers are configured (already done in config files)

### Monitor Performance

Use these tools:
- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://webpagetest.org
- **GTmetrix**: https://gtmetrix.com

Target metrics:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

---

## Security Checklist

- ✅ All environment variables are set correctly
- ✅ RLS policies are enabled on all tables
- ✅ HTTPS is enforced (automatic on all platforms)
- ✅ Security headers are configured
- ✅ CSRF protection is enabled
- ✅ Input sanitization is implemented
- ✅ Rate limiting is configured
- ✅ Email verification is enabled
- ✅ Strong password requirements
- ✅ Session timeout is configured

---

## Support

For issues or questions:
- Check [Supabase Docs](https://supabase.com/docs)
- Check [Stripe Docs](https://stripe.com/docs)
- Review application logs in deployment platform
- Check Supabase logs in Dashboard → Logs

---

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificate (automatic on most platforms)
3. Set up monitoring and alerts
4. Configure backup strategy
5. Set up staging environment
6. Implement CI/CD pipeline
7. Add analytics (Google Analytics, Plausible, etc.)
8. Set up error tracking (Sentry, LogRocket, etc.)

---

**Congratulations! Your PeptiSync application is now live! 🎉**

