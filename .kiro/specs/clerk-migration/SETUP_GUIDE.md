# Clerk Setup Guide

This guide walks you through setting up Clerk authentication for the PeptiSync application.

## Prerequisites

- Node.js and npm installed
- Supabase project set up
- Access to create a Clerk account

## Step 1: Create Clerk Account and Application

1. Go to [https://clerk.com](https://clerk.com) and sign up for a free account
2. Click "Create Application" in the dashboard
3. Enter application details:
   - **Name**: PeptiSync
   - **Application Type**: Web Application
   - **Framework**: React
4. Click "Create Application"

## Step 2: Configure Authentication Methods

In your Clerk Dashboard:

1. Go to **User & Authentication** > **Email, Phone, Username**
2. Enable **Email address** (required)
3. Enable **Email verification** (recommended)
4. Configure password requirements:
   - Minimum length: 8 characters
   - Require uppercase letter
   - Require number
   - Require special character (optional)

## Step 3: Enable Social Authentication (Optional)

1. Go to **User & Authentication** > **Social Connections**
2. Enable desired providers:
   - **Google**: Click "Enable" and follow OAuth setup
   - **GitHub**: Click "Enable" and follow OAuth setup
3. Configure OAuth redirect URLs:
   - Development: `http://localhost:8080`
   - Production: `https://your-domain.com`

## Step 4: Configure Multi-Factor Authentication (Optional)

1. Go to **User & Authentication** > **Multi-factor**
2. Enable **SMS verification** or **Authenticator app (TOTP)**
3. Configure backup codes

## Step 5: Get API Keys

1. Go to **API Keys** in the Clerk Dashboard
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Keep these keys secure - you'll need them for configuration

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Clerk Publishable Key to `.env`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

3. The Secret Key will be set in Supabase secrets (Step 8)

## Step 7: Customize Clerk Appearance

In Clerk Dashboard:

1. Go to **Customization** > **Theme**
2. Configure to match PeptiSync branding:
   - **Primary Color**: Your brand color
   - **Logo**: Upload PeptiSync logo
   - **Favicon**: Upload favicon

3. Go to **Customization** > **Paths**
4. Configure redirect URLs:
   - **Sign-in URL**: `/clerk-sign-in`
   - **Sign-up URL**: `/clerk-sign-up`
   - **After sign-in**: `/dashboard`
   - **After sign-up**: `/dashboard`

## Step 8: Set Up Webhooks

1. Go to **Webhooks** in Clerk Dashboard
2. Click "Add Endpoint"
3. Enter webhook URL:
   - Development: `https://your-project-id.supabase.co/functions/v1/clerk-webhook`
   - Production: Same URL (Supabase handles environments)
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click "Create"
6. Copy the **Signing Secret** (starts with `whsec_`)

## Step 9: Configure Supabase Secrets

Set the Clerk secrets in Supabase:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Set Clerk secrets
supabase secrets set CLERK_SECRET_KEY=sk_test_your_secret_key
supabase secrets set CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 10: Configure Session Settings

In Clerk Dashboard:

1. Go to **Sessions** > **Settings**
2. Configure session duration:
   - **Session lifetime**: 7 days
   - **Inactive session lifetime**: 30 minutes
3. Enable **Multi-session handling** if needed

## Step 11: Configure Email Templates (Optional)

Customize email templates in Clerk Dashboard:

1. Go to **Emails** > **Templates**
2. Customize templates:
   - Welcome email
   - Email verification
   - Password reset
   - Magic link
3. Add PeptiSync branding and messaging

## Step 12: Test Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8080/clerk-sign-up`
3. Create a test account
4. Verify email works
5. Test sign-in flow
6. Check that webhook creates profile in Supabase

## Step 13: Production Configuration

When deploying to production:

1. Create a production Clerk application (or use same app with production keys)
2. Update environment variables with production keys:
   - Use `pk_live_` publishable key
   - Use `sk_live_` secret key
3. Update webhook URL to production Supabase URL
4. Verify domain in Clerk Dashboard
5. Test all authentication flows in production

## Troubleshooting

### Issue: "Clerk is not configured"

**Solution**: Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in your `.env` file and restart the dev server.

### Issue: Webhooks not firing

**Solution**: 
1. Check webhook URL is correct in Clerk Dashboard
2. Verify Supabase Edge Function is deployed
3. Check webhook signing secret is set correctly
4. View webhook logs in Clerk Dashboard

### Issue: Users not syncing to Supabase

**Solution**:
1. Check Supabase Edge Function logs
2. Verify database migrations have been applied
3. Ensure RLS policies allow webhook to create profiles
4. Check webhook secret is correct

### Issue: Social auth not working

**Solution**:
1. Verify OAuth credentials in Clerk Dashboard
2. Check redirect URLs are configured correctly
3. Ensure social provider is enabled
4. Test OAuth flow in Clerk Dashboard test mode

## Security Checklist

Before going to production:

- [ ] Use production API keys (not test keys)
- [ ] Enable email verification
- [ ] Configure strong password requirements
- [ ] Set up webhook signature verification
- [ ] Enable rate limiting in Clerk Dashboard
- [ ] Configure session timeout appropriately
- [ ] Review and test all authentication flows
- [ ] Set up monitoring and alerts
- [ ] Document emergency procedures
- [ ] Test rollback procedure

## Support Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Discord**: https://clerk.com/discord
- **Clerk Support**: support@clerk.com
- **Supabase Documentation**: https://supabase.com/docs
- **Project Documentation**: See `.kiro/specs/clerk-migration/`

## Next Steps

After completing this setup:

1. Proceed to Task 2: Create database migrations
2. Implement webhook handler (Task 3)
3. Create auth context adapter (Task 4)
4. Continue with remaining migration tasks

For detailed implementation steps, see `.kiro/specs/clerk-migration/tasks.md`
