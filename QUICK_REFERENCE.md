# PeptiSync Nova - Quick Reference Card

Essential commands and information for daily development.

---

## 🚀 Quick Start Commands

```bash
# Install and start
npm install
npm run dev

# Open in browser
http://localhost:8080
```

---

## 🔐 Make Yourself Admin (First Time)

1. Register at: `http://localhost:8080/auth`
2. Go to: [Supabase SQL Editor](https://supabase.com/dashboard/project/rirckslupgqpcohgkomo/sql)
3. Run this (replace email):

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

4. Logout and login again
5. Visit: `http://localhost:8080/admin`

---

## 🌐 Important URLs

### Local Development
- **Home:** http://localhost:8080/
- **Store:** http://localhost:8080/store
- **Auth:** http://localhost:8080/auth
- **Admin:** http://localhost:8080/admin
- **Dashboard:** http://localhost:8080/dashboard

### Supabase
- **Dashboard:** https://supabase.com/dashboard/project/rirckslupgqpcohgkomo
- **SQL Editor:** https://supabase.com/dashboard/project/rirckslupgqpcohgkomo/sql
- **Storage:** https://supabase.com/dashboard/project/rirckslupgqpcohgkomo/storage/buckets

---

## 💳 Stripe Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Decline |
| `4000 0027 6000 3184` | 🔐 3D Secure |

**CVC:** Any 3 digits  
**Expiry:** Any future date

---

## ⚡ Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

### Supabase
```bash
npx supabase login                              # Login
npx supabase link --project-ref rirckslupgqpcohgkomo  # Link project
npx supabase db push                            # Apply migrations
npx supabase functions deploy create-payment-intent   # Deploy function
npx supabase secrets set KEY=value              # Set secret
npx supabase functions logs create-payment-intent     # View logs
```

### Deployment
```bash
vercel --prod        # Deploy to Vercel
netlify deploy --prod # Deploy to Netlify
git push origin main  # Deploy to Render (auto)
```

---

## 🔧 Useful SQL Queries

### Check Your Role
```sql
SELECT u.email, COALESCE(ur.role, 'user') as role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'YOUR_EMAIL';
```

### List All Users with Roles
```sql
SELECT 
  u.email,
  COALESCE(ur.role, 'user') as role,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

### Make Someone Admin
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Make Someone Moderator
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'moderator'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'moderator';
```

### Remove Admin Role (Make Regular User)
```sql
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Get Order Statistics
```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status != 'cancelled';
```

### Get Top Selling Products
```sql
SELECT 
  p.name,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY revenue DESC
LIMIT 10;
```

---

## 🐛 Quick Troubleshooting

### Can't Access Admin Panel
```sql
-- Run this, then logout/login
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'YOUR_EMAIL'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Payment Not Working
```bash
# Check Stripe key in .env
cat .env | grep STRIPE

# Set Stripe secret
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Deploy payment function
npx supabase functions deploy create-payment-intent
```

### Images Not Uploading
1. Go to Supabase Dashboard → Storage
2. Create buckets:
   - `avatars` (public)
   - `products` (public)
   - `documents` (private)

### Database Connection Error
```bash
# Check .env file
cat .env

# Restart dev server
npm run dev
```

---

## 📦 Storage Buckets Required

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public | User profile pictures |
| `products` | Public | Product images |
| `documents` | Private | Order documents |

**Create in:** [Supabase Storage](https://supabase.com/dashboard/project/rirckslupgqpcohgkomo/storage/buckets)

---

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=https://rirckslupgqpcohgkomo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=http://localhost:8080
```

**Get keys from:**
- Supabase: Settings → API
- Stripe: [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

---

## 🎯 User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full access to everything |
| **Moderator** | Can manage products & orders |
| **User** | Can browse & purchase (default) |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview |
| [QUICK_START.md](QUICK_START.md) | Setup guide |
| [ADMIN_ACCESS_GUIDE.md](ADMIN_ACCESS_GUIDE.md) | Admin panel access |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guide |
| [SECURITY.md](SECURITY.md) | Security details |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | Testing guide |

---

## 🆘 Need Help?

1. Check [README.md](README.md) troubleshooting section
2. Review [ADMIN_ACCESS_GUIDE.md](ADMIN_ACCESS_GUIDE.md)
3. See [QUICK_START.md](QUICK_START.md) for setup
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com/test
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

**Last Updated:** 2025-10-11  
**Version:** 1.0  
**Project:** PeptiSync Nova

