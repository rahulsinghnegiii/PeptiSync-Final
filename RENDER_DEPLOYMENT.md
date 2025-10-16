# Render Deployment Guide for PeptiSync

## Prerequisites
- GitHub repository: https://github.com/rahulsinghnegiii/peptisync-nova
- Render account: https://render.com
- Supabase project configured

## Step 1: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select the repository: `rahulsinghnegiii/peptisync-nova`

## Step 2: Configure Build Settings

### Basic Settings:
- **Name:** `peptisync-nova`
- **Region:** Choose closest to your users (e.g., Oregon (US West))
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `Node`

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm run preview
```

**Note:** For production, you should use a proper static file server. Update the start command to:
```bash
npx serve -s dist -l 10000
```

And add `serve` to your dependencies.

## Step 3: Environment Variables

Add the following environment variables in Render dashboard:

### Required Variables:
```
VITE_SUPABASE_URL=https://ntcydolfuonagdtdhpot.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3lkb2xmdW9uYWdkdGRocG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMjQsImV4cCI6MjA3NjEzNzMyNH0.VZt8cGPoIWQC4bQlzq792UUr4Ghazycso-9ySnPCA-k
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_APP_URL=https://peptisync-nova.onrender.com
NODE_ENV=production
```

### Optional Variables (for analytics):
```
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_GA_TRACKING_ID=your_google_analytics_id_here
```

## Step 4: Update package.json

Add the `serve` package for production serving:

```bash
npm install --save serve
```

Update the `scripts` section in `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "serve -s dist -l 10000"
  }
}
```

Then update the Render start command to:
```bash
npm run serve
```

## Step 5: Configure Render Settings

### Auto-Deploy:
- ✅ Enable "Auto-Deploy" for the main branch
- This will automatically deploy when you push to GitHub

### Health Check Path:
- Set to `/` (root path)

### Instance Type:
- **Free Tier:** Good for testing
- **Starter ($7/month):** Recommended for production
  - No sleep on inactivity
  - Better performance
  - Custom domains

## Step 6: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Start the server

3. Monitor the deployment logs in real-time

## Step 7: Post-Deployment Configuration

### Update Supabase Settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Render URL to:
   - **Site URL:** `https://peptisync-nova.onrender.com`
   - **Redirect URLs:** 
     - `https://peptisync-nova.onrender.com/auth`
     - `https://peptisync-nova.onrender.com/dashboard`
     - `https://peptisync-nova.onrender.com/update-password`

### Update Stripe Settings:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://ntcydolfuonagdtdhpot.supabase.co/functions/v1/create-payment-intent`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Deploy Supabase Edge Functions:

```bash
# Deploy email function
supabase functions deploy send-email

# Deploy payment function
supabase functions deploy create-payment-intent

# Deploy permissions function
supabase functions deploy check-permissions
```

### Set Supabase Secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
supabase secrets set RESEND_API_KEY=re_your_resend_api_key_here
supabase secrets set VITE_APP_URL=https://peptisync-nova.onrender.com
```

## Step 8: Create Storage Buckets

```bash
supabase storage create avatars --public
supabase storage create products --public
supabase storage create documents
```

## Step 9: Verify Deployment

### Test Core Functionality:
1. ✅ Visit your Render URL
2. ✅ Test sign up / sign in
3. ✅ Browse products
4. ✅ Add items to cart
5. ✅ Test checkout flow (use Stripe test card: 4242 4242 4242 4242)
6. ✅ Check order history
7. ✅ Test admin panel (if admin user created)

### Check Logs:
- Monitor Render logs for any errors
- Check Supabase logs for database queries
- Verify Edge Function logs

## Step 10: Custom Domain (Optional)

### Add Custom Domain:
1. Go to Render Dashboard → Your Service → Settings
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `peptisync.com`)
4. Add the CNAME record to your DNS provider:
   - **Type:** CNAME
   - **Name:** @ or www
   - **Value:** `peptisync-nova.onrender.com`

### Update Environment Variables:
```
VITE_APP_URL=https://your-custom-domain.com
```

### Update Supabase URLs:
- Update all redirect URLs to use your custom domain

## Troubleshooting

### Build Fails:
- Check Node version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### App Doesn't Load:
- Verify environment variables are set correctly
- Check that VITE_ prefix is used for client-side variables
- Ensure build output is in `dist` folder

### Authentication Issues:
- Verify Supabase URL configuration
- Check redirect URLs in Supabase dashboard
- Ensure CORS is configured correctly

### Payment Issues:
- Verify Stripe keys are correct
- Check Edge Function is deployed
- Ensure webhook endpoint is configured

## Performance Optimization

### Enable Compression:
Render automatically enables gzip compression

### CDN Configuration:
- Render provides CDN by default
- Static assets are automatically cached

### Monitoring:
- Use Render's built-in metrics
- Set up Sentry for error tracking
- Configure uptime monitoring

## Scaling

### Horizontal Scaling:
- Upgrade to higher tier for more resources
- Enable auto-scaling (available on paid plans)

### Database Optimization:
- Monitor Supabase usage
- Upgrade Supabase plan if needed
- Optimize queries and indexes

## Backup Strategy

### Database Backups:
- Supabase provides automatic daily backups
- Download manual backups regularly

### Code Backups:
- GitHub repository serves as code backup
- Tag releases for version control

## Security Checklist

- ✅ Environment variables set correctly
- ✅ HTTPS enabled (automatic on Render)
- ✅ Supabase RLS policies active
- ✅ CORS configured properly
- ✅ API keys secured
- ✅ Rate limiting configured
- ✅ Input validation active

## Support

### Render Support:
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Supabase Support:
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

---

## Quick Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] Render web service created
- [ ] Environment variables configured
- [ ] Build and start commands set
- [ ] Deployment successful
- [ ] Supabase URLs updated
- [ ] Edge Functions deployed
- [ ] Storage buckets created
- [ ] Stripe webhooks configured
- [ ] Core functionality tested
- [ ] Custom domain added (optional)
- [ ] Monitoring configured

---

**Deployment URL:** https://peptisync-nova.onrender.com  
**Repository:** https://github.com/rahulsinghnegiii/peptisync-nova  
**Last Updated:** October 16, 2025
