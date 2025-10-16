# PeptiSync Nova - Admin Access Guide

Complete guide for accessing and managing the admin panel.

---

## 🔐 Admin Panel Access

### Admin Panel URL

```
http://localhost:8080/admin
```

Or in production:
```
https://your-domain.com/admin
```

---

## 👤 Creating Your First Admin User

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Register a User Account**
   - Go to `http://localhost:8080/auth`
   - Click "Sign Up" tab
   - Register with your email (e.g., `admin@peptisync.com`)
   - Complete registration

2. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `rirckslupgqpcohgkomo`
   - Click "SQL Editor" in the left sidebar

3. **Run This SQL Query**

   ```sql
   -- Replace 'your-email@example.com' with your actual email
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (user_id) 
   DO UPDATE SET role = 'admin';
   ```

4. **Verify Admin Role**

   ```sql
   -- Check if admin role was assigned
   SELECT 
     u.email,
     ur.role,
     ur.created_at
   FROM auth.users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   WHERE u.email = 'your-email@example.com';
   ```

5. **Logout and Login Again**
   - Go back to your app
   - Logout from current session
   - Login again with your admin credentials
   - Navigate to `/admin`

---

## 🔄 Changing User Roles

### Make Someone an Admin

```sql
-- Replace with the user's email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

### Make Someone a Moderator

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'moderator'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'moderator';
```

### Remove Admin/Moderator (Make Regular User)

```sql
-- Option 1: Delete the role (defaults to 'user')
DELETE FROM user_roles
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Option 2: Explicitly set to 'user'
UPDATE user_roles
SET role = 'user'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

---

## 📋 User Role Hierarchy

### Role Levels

1. **Admin** (Highest)
   - Full access to everything
   - Can manage products
   - Can manage orders
   - Can view analytics
   - Can manage users
   - Can access admin panel

2. **Moderator** (Medium)
   - Can manage products
   - Can manage orders
   - Can view analytics
   - Cannot manage users
   - Can access admin panel

3. **User** (Default)
   - Can browse products
   - Can make purchases
   - Can write reviews
   - Can manage own profile
   - Cannot access admin panel

---

## 🛠️ Admin Panel Features

### 1. Analytics Dashboard
- **Path:** `/admin` (default tab)
- **Features:**
  - Total revenue tracking
  - Total orders count
  - Total products count
  - Total customers count
  - Revenue trend chart (last 30 days)
  - Top selling products table
  - Order status distribution

### 2. Products Management
- **Path:** `/admin?tab=products`
- **Features:**
  - View all products
  - Add new products
  - Edit existing products
  - Delete products
  - Upload product images
  - Manage inventory (stock levels)
  - Set product prices
  - Manage categories

### 3. Orders Management
- **Path:** `/admin?tab=orders`
- **Features:**
  - View all orders
  - Filter orders by status
  - Update order status
  - Add tracking numbers
  - Add order notes
  - View order details
  - View customer information

### 4. Users Management
- **Path:** `/admin?tab=users`
- **Features:**
  - View all users
  - View user details
  - View user order history
  - Search users
  - Filter users

---

## 🔍 Finding User IDs

### Get All Users with Roles

```sql
SELECT 
  u.id,
  u.email,
  u.created_at as registered_at,
  COALESCE(ur.role, 'user') as role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

### Get All Admins

```sql
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
INNER JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### Get All Moderators

```sql
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
INNER JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'moderator'
ORDER BY ur.created_at DESC;
```

---

## 🚨 Troubleshooting

### Issue: "Access Denied" When Visiting /admin

**Possible Causes:**
1. User doesn't have admin/moderator role
2. User needs to logout and login again
3. Role wasn't assigned correctly

**Solutions:**

1. **Verify Role in Database**
   ```sql
   SELECT 
     u.email,
     ur.role
   FROM auth.users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   WHERE u.email = 'your-email@example.com';
   ```

2. **Assign Admin Role**
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (user_id) 
   DO UPDATE SET role = 'admin';
   ```

3. **Clear Session and Login Again**
   - Logout from the app
   - Clear browser cache/cookies
   - Login again
   - Try accessing `/admin`

### Issue: Role Changes Not Taking Effect

**Solution:**
- Logout and login again
- The role is checked on each page load
- Session needs to be refreshed

### Issue: Can't Find User Email

**Get All Registered Emails:**
```sql
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

---

## 📊 Useful Admin Queries

### Get Order Statistics

```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM orders
WHERE status != 'cancelled';
```

### Get Product Performance

```sql
SELECT 
  p.name,
  p.price,
  p.stock_quantity,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.stock_quantity
ORDER BY total_revenue DESC NULLS LAST;
```

### Get Customer Lifetime Value

```sql
SELECT 
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as lifetime_value,
  MAX(o.created_at) as last_order_date
FROM auth.users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status != 'cancelled'
GROUP BY u.id, u.email
ORDER BY lifetime_value DESC;
```

---

## 🔐 Security Best Practices

### 1. Use Strong Passwords for Admin Accounts
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't reuse passwords

### 2. Limit Admin Access
- Only assign admin role to trusted users
- Use moderator role for limited admin access
- Regularly audit admin users

### 3. Monitor Admin Activity
- Check admin panel access logs
- Review order modifications
- Monitor product changes

### 4. Secure Your Supabase Project
- Enable 2FA on Supabase account
- Use strong database password
- Restrict API access if needed
- Enable RLS policies (already done)

---

## 📝 Quick Reference

### Admin User Creation (One Command)

```sql
-- Replace YOUR_EMAIL with your actual email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Check Your Current Role

```sql
-- Replace YOUR_EMAIL with your actual email
SELECT 
  u.email,
  COALESCE(ur.role, 'user') as current_role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'YOUR_EMAIL';
```

### Admin Panel URLs

- **Local Development:** `http://localhost:8080/admin`
- **Production:** `https://your-domain.com/admin`

---

## 🎯 Step-by-Step: First Time Setup

1. ✅ Register account at `/auth`
2. ✅ Open Supabase SQL Editor
3. ✅ Run admin role assignment query
4. ✅ Logout and login again
5. ✅ Navigate to `/admin`
6. ✅ Start managing your store!

---

**Need Help?** Check the troubleshooting section above or review the [SECURITY.md](SECURITY.md) file for more details on the authorization system.

**Last Updated:** 2025-10-11  
**Version:** 1.0

