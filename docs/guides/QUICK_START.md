# PeptiSync Nova - Quick Start Guide

Get PeptiSync Nova up and running in under 10 minutes!

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Stripe account (test mode)

### Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd peptisync-nova-main

# Install dependencies
npm install
```

### Step 2: Set Up Supabase (3 minutes)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name it "peptisync-nova"
   - Choose a region and password

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the Project URL
   - Copy the `anon/public` key

3. **Apply Database Migrations**
   ```bash
   # Login to Supabase
   npx supabase login
   
   # Link your project
   npx supabase link --project-ref YOUR_PROJECT_ID
   
   # Apply migrations
   npx supabase db push
   ```

4. **Create Storage Buckets**
   - Go to Storage in Supabase Dashboard
   - Create bucket: `avatars` (public)
   - Create bucket: `products` (public)
   - Create bucket: `documents` (private)

### Step 3: Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_APP_URL=http://localhost:8080
```

### Step 4: Get Stripe Test Key (1 minute)

1. Go to [stripe.com/test](https://dashboard.stripe.com/test/apikeys)
2. Copy your "Publishable key" (starts with `pk_test_`)
3. Add it to `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`

### Step 5: Deploy Edge Functions (2 minutes)

```bash
# Set Stripe secret in Supabase
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# Deploy payment function
npx supabase functions deploy create-payment-intent

# Deploy email function (optional for now)
npx supabase functions deploy send-email

# Deploy permissions function
npx supabase functions deploy check-permissions
```

### Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) 🎉

---

## 🧪 Test the Application

### Create Your First Admin User

1. Go to [http://localhost:8080/auth](http://localhost:8080/auth)
2. Click "Sign Up"
3. Register with your email
4. Check your email for verification link (if email is configured)

### Make Yourself Admin

```sql
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your email

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Add Test Products

1. Login to your account
2. Go to [http://localhost:8080/admin](http://localhost:8080/admin)
3. Click "Products" tab
4. Click "Add Product"
5. Fill in product details
6. Upload an image
7. Save

### Test Checkout Flow

1. Go to [http://localhost:8080/store](http://localhost:8080/store)
2. Add products to cart
3. Click cart icon
4. Click "Checkout"
5. Fill shipping information
6. Use test card: `4242 4242 4242 4242`
7. Any future expiry date
8. Any 3-digit CVC
9. Complete payment

---

## 📧 Optional: Set Up Email (5 minutes)

### Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Copy the key (starts with `re_`)

### Configure Email Service

```bash
# Set Resend API key
npx supabase secrets set RESEND_API_KEY=re_your_api_key

# Set app URL
npx supabase secrets set VITE_APP_URL=http://localhost:8080

# Deploy email function
npx supabase functions deploy send-email
```

Now emails will be sent for:
- Welcome (registration)
- Order confirmation
- Order status updates
- Password reset

---

## 🎯 What's Working Now

After following the quick start, you have:

✅ **User Authentication**
- Registration and login
- Password reset
- Email verification (if configured)

✅ **Product Management**
- Browse products
- Search and filter
- Product details
- Admin CRUD operations

✅ **Shopping Cart**
- Add/remove items
- Update quantities
- Real-time sync

✅ **Checkout**
- Shipping information
- Stripe payment processing
- Order confirmation

✅ **Admin Panel**
- Product management
- Order management
- Analytics dashboard

✅ **Security**
- CSRF protection
- XSS prevention
- RLS policies
- Rate limiting

---

## 🐛 Troubleshooting

### "Invalid API key" Error

**Problem:** Supabase connection fails

**Solution:**
1. Check `.env` file has correct values
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Restart dev server after changing `.env`

### "Payment failed" Error

**Problem:** Stripe payment doesn't process

**Solution:**
1. Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
2. Check Edge Function is deployed: `npx supabase functions list`
3. Verify `STRIPE_SECRET_KEY` is set: `npx supabase secrets list`
4. Use test card: `4242 4242 4242 4242`

### "Permission denied" Error

**Problem:** Can't access admin panel

**Solution:**
1. Make sure you're logged in
2. Run the SQL query to make yourself admin (see above)
3. Logout and login again

### Images Not Uploading

**Problem:** Product/avatar images fail to upload

**Solution:**
1. Check storage buckets exist in Supabase Dashboard
2. Verify buckets are public (avatars, products)
3. Check file size (max 5MB for products, 2MB for avatars)
4. Verify file type (jpg, png, webp only)

### Migrations Failed

**Problem:** `supabase db push` fails

**Solution:**
1. Check you're linked to correct project: `npx supabase link --project-ref YOUR_ID`
2. Try resetting: `npx supabase db reset`
3. Apply migrations manually via Supabase SQL Editor

---

## 📚 Next Steps

### Learn More

- **Full Documentation:** See [PROJECT_README.md](PROJECT_README.md)
- **Deployment Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security Details:** See [SECURITY.md](SECURITY.md)
- **Testing Guide:** See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

### Customize Your App

1. **Branding**
   - Update logo in `src/components/Navigation.tsx`
   - Change colors in `tailwind.config.ts`
   - Update meta tags in `index.html`

2. **Features**
   - Add more product categories
   - Customize email templates
   - Add more payment methods
   - Implement discount codes

3. **Deploy to Production**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Use production Stripe keys
   - Configure custom domain
   - Set up monitoring

---

## 🎓 Understanding the Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Supabase** - Database, Auth, Storage
- **PostgreSQL** - Database
- **Edge Functions** - Serverless functions

### Services
- **Stripe** - Payment processing
- **Resend** - Email service

---

## 💡 Tips for Development

### Hot Reload
Changes to code automatically reload the browser.

### Database Changes
After modifying database schema:
```bash
npx supabase db push
```

### View Logs
```bash
# Edge Function logs
npx supabase functions logs create-payment-intent

# Database logs
# View in Supabase Dashboard → Logs
```

### Reset Database
```bash
# WARNING: This deletes all data
npx supabase db reset
```

---

## 🆘 Getting Help

### Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **React Docs:** [react.dev](https://react.dev)
- **Tailwind Docs:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Common Issues

Check [DEPLOYMENT.md](DEPLOYMENT.md) → Troubleshooting section

---

## ✅ Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] Edge Functions deployed
- [ ] Dev server running (`npm run dev`)
- [ ] Admin user created
- [ ] Test products added
- [ ] Test checkout completed

---

**You're all set! Start building amazing features! 🚀**

For detailed documentation, see [PROJECT_README.md](PROJECT_README.md)

