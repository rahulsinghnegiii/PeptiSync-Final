# Migration Guide: Complete Schema Enhancements

This guide walks you through applying the database schema enhancements for the PeptiSync e-commerce platform.

## Overview

The migration `20251010000000_complete_schema_enhancements.sql` adds:

✅ **New Tables:**
- `reviews` - Product reviews and ratings

✅ **New Columns:**
- `profiles.shipping_address` (JSONB) - Default shipping address
- `cart_items.product_id` (UUID) - Foreign key to products
- `products.rating` (NUMERIC) - Average product rating
- `products.review_count` (INTEGER) - Total review count
- `products.search_vector` (tsvector) - Full-text search
- `orders.payment_intent_id` (TEXT) - Stripe payment reference
- `order_items.product_id` (UUID) - Foreign key to products

✅ **Performance Indexes:**
- 20+ indexes on frequently queried columns
- GIN index for full-text product search
- Composite indexes for common query patterns

✅ **Helper Functions:**
- `update_product_rating()` - Auto-update ratings on review changes
- `user_purchased_product()` - Check if user purchased a product
- `products_search_vector_update()` - Maintain search index

✅ **Constraints:**
- Order status validation
- Review rating range (1-5)
- Review comment length (10-500 chars)

## Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project set up:**
   - Local: `npx supabase init` (if not already done)
   - Remote: Have your project reference ready

## Step 1: Apply Migration Locally

### Option A: Using Supabase CLI (Recommended)

```bash
# Start local Supabase (if not running)
npx supabase start

# Apply the migration
npx supabase db push

# Verify the migration
npx supabase db diff
```

### Option B: Manual Application

If you prefer to apply manually:

```bash
# Connect to your local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run the migration file
\i supabase/migrations/20251010000000_complete_schema_enhancements.sql

# Exit psql
\q
```

## Step 2: Verify Migration

Run the verification script:

```bash
# Using Supabase CLI
npx supabase db execute --file supabase/migrations/verify_schema.sql

# Or using psql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/verify_schema.sql
```

Expected output should show all checks passing with "✓ PASS" status.

## Step 3: Create Storage Buckets

The migration requires three storage buckets. Create them using the Supabase CLI or dashboard:

### Using Supabase CLI:

```bash
# Create avatars bucket (public)
npx supabase storage create avatars --public

# Create products bucket (public)
npx supabase storage create products --public

# Create documents bucket (private)
npx supabase storage create documents
```

### Using Supabase Dashboard:

1. Go to Storage in your Supabase dashboard
2. Click "Create bucket"
3. Create these buckets:
   - **avatars** (public) - Max 2MB, MIME: image/jpeg, image/png, image/webp
   - **products** (public) - Max 5MB, MIME: image/jpeg, image/png, image/webp
   - **documents** (private) - Max 10MB, MIME: application/pdf

## Step 4: Test the Schema

### Test 1: Create a Product

```sql
INSERT INTO public.products (name, description, price, category, stock_quantity)
VALUES ('Test Product', 'A test product', 99.99, 'supplements', 100);
```

### Test 2: Add to Cart

```sql
-- Replace <user_id> and <product_id> with actual IDs
INSERT INTO public.cart_items (user_id, product_id, product_name, product_price, quantity)
VALUES ('<user_id>', '<product_id>', 'Test Product', 99.99, 1);
```

### Test 3: Create a Review

```sql
-- Replace <user_id> and <product_id> with actual IDs
INSERT INTO public.reviews (user_id, product_id, rating, comment)
VALUES ('<user_id>', '<product_id>', 5, 'This is a great product! Highly recommended.');
```

### Test 4: Verify Rating Update

```sql
-- Check that product rating was automatically updated
SELECT id, name, rating, review_count FROM public.products;
```

### Test 5: Full-Text Search

```sql
-- Search for products
SELECT name, description, category
FROM public.products
WHERE search_vector @@ to_tsquery('english', 'test');
```

## Step 5: Apply to Production

⚠️ **IMPORTANT:** Always test in a staging environment first!

### Backup First

```bash
# Create a backup of your production database
npx supabase db dump --db-url "postgresql://postgres:[password]@[host]:5432/postgres" > backup.sql
```

### Apply Migration

```bash
# Link to your production project
npx supabase link --project-ref your-project-ref

# Push the migration
npx supabase db push

# Verify
npx supabase db execute --file supabase/migrations/verify_schema.sql
```

### Create Production Storage Buckets

Repeat Step 3 for your production environment.

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:** The migration uses `IF NOT EXISTS` clauses, so this shouldn't happen. If it does, check if you have conflicting table names.

### Issue: RLS policies prevent data access

**Solution:** Ensure users have proper roles assigned in the `user_roles` table:

```sql
-- Grant admin role to a user
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user_id>', 'admin');
```

### Issue: Search not working

**Solution:** Rebuild the search vectors:

```sql
UPDATE public.products
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C');
```

### Issue: Indexes not improving performance

**Solution:** Analyze the tables to update statistics:

```sql
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.reviews;
ANALYZE public.cart_items;
```

## Rollback Plan

If you need to rollback the migration:

### Option 1: Reset to Previous Migration

```bash
npx supabase db reset --version 20251009015932
```

### Option 2: Manual Rollback

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Remove new columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE public.cart_items DROP COLUMN IF EXISTS product_id;
ALTER TABLE public.products DROP COLUMN IF EXISTS rating;
ALTER TABLE public.products DROP COLUMN IF EXISTS review_count;
ALTER TABLE public.products DROP COLUMN IF EXISTS search_vector;
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_intent_id;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS product_id;

-- Drop indexes (they'll be recreated if needed)
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_rating;
-- ... (drop other indexes as needed)

-- Drop functions
DROP FUNCTION IF EXISTS public.update_product_rating();
DROP FUNCTION IF EXISTS public.user_purchased_product(uuid, uuid);
DROP FUNCTION IF EXISTS public.products_search_vector_update();
```

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] Verification script shows all checks passing
- [ ] Storage buckets created
- [ ] Test data inserted and retrieved successfully
- [ ] Full-text search working
- [ ] Product ratings updating automatically
- [ ] RLS policies working correctly
- [ ] Application code updated to use new schema
- [ ] Frontend components updated to use new features
- [ ] Documentation updated

## Next Steps

After successfully applying the migration:

1. **Update TypeScript types** to match new schema
2. **Create React hooks** for new features (reviews, enhanced cart)
3. **Build UI components** for reviews and ratings
4. **Implement Stripe integration** using payment_intent_id
5. **Add full-text search** to the store page
6. **Test end-to-end flows** with the new schema

## Support

If you encounter issues:

1. Check the verification script output
2. Review Supabase logs: `npx supabase logs`
3. Check RLS policies are correctly configured
4. Ensure user roles are properly assigned
5. Verify storage buckets are created and accessible

## Schema Diagram

```
┌─────────────┐
│   profiles  │
├─────────────┤
│ shipping_   │──┐
│ address     │  │
└─────────────┘  │
                 │
┌─────────────┐  │    ┌─────────────┐
│  products   │  │    │ cart_items  │
├─────────────┤  │    ├─────────────┤
│ rating      │◄─┼────│ product_id  │
│ review_count│  │    └─────────────┘
│ search_     │  │
│ vector      │  │    ┌─────────────┐
└─────────────┘  │    │   orders    │
       ▲         │    ├─────────────┤
       │         └────│ shipping_   │
       │              │ address     │
       │              │ payment_    │
       │              │ intent_id   │
┌─────────────┐       └─────────────┘
│   reviews   │              │
├─────────────┤              │
│ product_id  │              ▼
│ rating      │       ┌─────────────┐
│ comment     │       │order_items  │
│ is_verified │       ├─────────────┤
└─────────────┘       │ product_id  │
                      └─────────────┘
```

---

**Migration Version:** 20251010000000  
**Created:** 2025-10-10  
**Status:** Ready for deployment
