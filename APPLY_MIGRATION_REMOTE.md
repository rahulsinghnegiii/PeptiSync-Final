# Apply Migration to Remote Supabase (No Docker Required)

Since you're working with a remote Supabase project, here are your options:

## Option 1: Supabase Dashboard (Recommended - Easiest)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/rirckslupgqpcohgkomo

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Create a new query**
   - Click "New query"

4. **Copy and paste the migration**
   - Open: `supabase/migrations/20251010000000_complete_schema_enhancements.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

5. **Run the migration**
   - Click "Run" or press Ctrl+Enter
   - Wait for completion (should take 5-10 seconds)

6. **Verify success**
   - You should see "Success. No rows returned"
   - Check the "Table Editor" to see new tables and columns

7. **Create Storage Buckets**
   - Go to "Storage" in the left sidebar
   - Click "Create bucket"
   - Create these three buckets:
     - **avatars** (public) - For user profile pictures
     - **products** (public) - For product images  
     - **documents** (private) - For order receipts

## Option 2: Using Supabase CLI (Requires linking)

If you prefer CLI, first link your project:

```bash
# Link to your remote project
npx supabase link --project-ref rirckslupgqpcohgkomo

# You'll be prompted for your database password
# Then push the migration
npx supabase db push
```

## Option 3: Direct Database Connection (Advanced)

If you have the database connection string:

```bash
# Using psql (if installed)
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres" -f supabase/migrations/20251010000000_complete_schema_enhancements.sql
```

## Verification

After applying the migration, verify it worked:

### Via Dashboard:
1. Go to "Table Editor"
2. Check for these tables:
   - ✅ profiles (should have `shipping_address` column)
   - ✅ products (should have `rating`, `review_count`, `search_vector` columns)
   - ✅ cart_items (should have `product_id` column)
   - ✅ reviews (new table)
   - ✅ orders (should have `payment_intent_id` column)
   - ✅ order_items (should have `product_id` column)

### Via SQL Editor:
Run this query to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'products', 'cart_items', 'orders', 'order_items', 'reviews')
ORDER BY table_name;

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews';
```

## What This Migration Adds

✅ **Reviews System**
- New `reviews` table for product ratings and comments
- Automatic rating calculation for products
- One review per user per product

✅ **Enhanced Cart**
- Links cart items to actual products via `product_id`
- Maintains data integrity

✅ **Shipping Addresses**
- JSONB column in profiles for default shipping address

✅ **Performance**
- 20+ indexes for faster queries
- Full-text search for products

✅ **Payment Integration**
- `payment_intent_id` column for Stripe payments

## Troubleshooting

**Error: "relation already exists"**
- Some tables might already exist from previous migrations
- This is OK - the migration uses `IF NOT EXISTS` clauses

**Error: "permission denied"**
- Make sure you're logged in as the project owner
- Check your database password is correct

**Can't find the migration file?**
- It's located at: `supabase/migrations/20251010000000_complete_schema_enhancements.sql`

## Next Steps

After successful migration:
1. ✅ Verify all tables and columns exist
2. ✅ Create storage buckets (avatars, products, documents)
3. ✅ Update your `.env` file if needed
4. ✅ Proceed to Task 2: Implement enhanced cart functionality

---

**Project ID:** rirckslupgqpcohgkomo  
**Migration File:** `supabase/migrations/20251010000000_complete_schema_enhancements.sql`
