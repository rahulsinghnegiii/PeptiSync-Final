# Database Setup Instructions

## Issue: "Could not find the table 'public.profiles' in the schema cache"

This error means the database migrations haven't been applied to your Supabase database yet.

## Solution: Apply Database Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   supabase link --project-ref rirckslupgqpcohgkomo
   ```

4. **Apply all migrations**:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rirckslupgqpcohgkomo

2. Navigate to **SQL Editor** in the left sidebar

3. Apply migrations in this order:

   **Step 1: Create profiles table**
   - Open `supabase/migrations/20250928055643_ad34655a-c62e-4bb1-82e7-00d2063de360.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run"

   **Step 2: Create cart and orders tables**
   - Open `supabase/migrations/20251007160128_12707812-fb93-433a-b8e4-6e0e5ba3fc4b.sql`
   - Copy and run

   **Step 3: Create user roles and products**
   - Open `supabase/migrations/20251009015932_a43dc283-7bec-40d9-9ac6-61ddfadd0f73.sql`
   - Copy and run

   **Step 4: Add Clerk support** (IMPORTANT for Clerk migration)
   - Open `supabase/migrations/20251015000000_add_clerk_support.sql`
   - Copy and run

   **Step 5: Apply other migrations**
   - Continue with remaining migration files in chronological order

### Option 3: Quick Setup Script

Run this command to apply all migrations at once:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Apply migrations
for file in supabase/migrations/*.sql; do
  echo "Applying $file..."
  supabase db execute --file "$file"
done
```

## Verify Database Setup

After applying migrations, verify the tables exist:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see these tables:
   - ✅ profiles
   - ✅ user_roles
   - ✅ products
   - ✅ cart_items
   - ✅ orders
   - ✅ order_items
   - ✅ reviews
   - ✅ auth_migration_status (new for Clerk)

## Common Issues

### Issue: "relation already exists"
**Solution**: Some tables already exist. This is fine - skip that migration and continue with the next one.

### Issue: "permission denied"
**Solution**: Make sure you're using the service role key or are logged in as the project owner.

### Issue: "function does not exist"
**Solution**: Make sure you're applying migrations in chronological order (by filename).

## After Database Setup

Once migrations are applied:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Test the application**:
   - Visit: http://localhost:8080/sign-up
   - Create a test account
   - Check Supabase Dashboard → Table Editor → profiles
   - You should see your new profile with a `clerk_id`

## Troubleshooting

### Check if migrations were applied:

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### Check if profiles table exists:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

### Manually create profiles table (emergency fallback):

If migrations fail, you can manually create the profiles table:

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clerk_id TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  membership_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_auth_id CHECK (
    (user_id IS NOT NULL AND clerk_id IS NULL) OR 
    (user_id IS NULL AND clerk_id IS NOT NULL) OR
    (user_id IS NOT NULL AND clerk_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);
```

## Need Help?

If you're still having issues:

1. Check Supabase logs in Dashboard → Logs
2. Verify your Supabase URL and keys in `.env`
3. Make sure you're connected to the correct project
4. Try the Supabase CLI method (most reliable)

---

**Quick Command Summary:**

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref rirckslupgqpcohgkomo

# Apply migrations
supabase db push

# Restart dev server
npm run dev
```

That's it! Your database should now be set up correctly. 🎉
