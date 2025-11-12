# Step-by-Step: Apply Migration via Supabase Dashboard

## Why Use the Dashboard?
- ✅ No Docker Desktop required
- ✅ No CLI setup needed
- ✅ Works directly with your remote database
- ✅ Visual feedback on success/errors

## Step 1: Open Your Supabase Project

1. Go to: https://supabase.com/dashboard/project/rirckslupgqpcohgkomo
2. Log in if prompted
3. You should see your project dashboard

## Step 2: Navigate to SQL Editor

1. Look at the left sidebar
2. Click on **"SQL Editor"** (icon looks like `</>`)
3. You'll see the SQL Editor interface

## Step 3: Create a New Query

1. Click the **"New query"** button (top right)
2. A blank SQL editor will open

## Step 4: Copy the Migration File

1. Open the file: `supabase/migrations/20251010000000_complete_schema_enhancements.sql`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)

## Step 5: Paste and Run

1. Go back to the Supabase SQL Editor
2. Paste the migration SQL (Ctrl+V)
3. Click **"Run"** button (or press Ctrl+Enter)
4. Wait 5-10 seconds for execution

## Step 6: Check for Success

You should see one of these messages:
- ✅ **"Success. No rows returned"** - Perfect! Migration applied.
- ✅ **"Success"** with some output - Also good!
- ❌ **Error message** - See troubleshooting below

## Step 7: Verify the Migration

### Quick Visual Check:
1. Click **"Table Editor"** in the left sidebar
2. Look for these tables:
   - `profiles` - Should have a `shipping_address` column
   - `products` - Should have `rating`, `review_count` columns
   - `reviews` - This is a NEW table
   - `cart_items` - Should have `product_id` column
   - `orders` - Should have `payment_intent_id` column
   - `order_items` - Should have `product_id` column

### Detailed Verification:
1. Go back to **SQL Editor**
2. Click **"New query"**
3. Copy contents of `supabase/migrations/verify_migration_simple.sql`
4. Paste and click **"Run"**
5. Check that all results show ✓ EXISTS or correct counts

## Step 8: Create Storage Buckets

1. Click **"Storage"** in the left sidebar
2. Click **"Create bucket"** button

### Create Bucket 1: avatars
- **Name:** `avatars`
- **Public:** ✅ Yes (toggle ON)
- Click **"Create bucket"**

### Create Bucket 2: products
- **Name:** `products`
- **Public:** ✅ Yes (toggle ON)
- Click **"Create bucket"**

### Create Bucket 3: documents
- **Name:** `documents`
- **Public:** ❌ No (toggle OFF - keep private)
- Click **"Create bucket"**

## Step 9: Configure Bucket Policies (Optional but Recommended)

For each bucket, you can set file size limits and allowed types:

### For avatars bucket:
1. Click on `avatars` bucket
2. Go to "Policies" tab
3. Set max file size: 2MB
4. Allowed types: image/jpeg, image/png, image/webp

### For products bucket:
1. Click on `products` bucket
2. Go to "Policies" tab
3. Set max file size: 5MB
4. Allowed types: image/jpeg, image/png, image/webp

### For documents bucket:
1. Click on `documents` bucket
2. Go to "Policies" tab
3. Set max file size: 10MB
4. Allowed types: application/pdf

## ✅ You're Done!

Your database is now ready with:
- ✅ Reviews system
- ✅ Enhanced cart with product references
- ✅ Shipping address support
- ✅ Product ratings
- ✅ Full-text search
- ✅ Payment integration support
- ✅ 20+ performance indexes
- ✅ Storage buckets for images and documents

## Troubleshooting

### Error: "relation already exists"
**Cause:** Some tables were already created  
**Solution:** This is OK! The migration uses `IF NOT EXISTS` clauses. Continue anyway.

### Error: "permission denied"
**Cause:** Not logged in as project owner  
**Solution:** Make sure you're logged in with the correct account

### Error: "syntax error"
**Cause:** Migration file wasn't copied completely  
**Solution:** Make sure you copied the ENTIRE file, from the first `--` comment to the last line

### Can't find SQL Editor
**Solution:** Look for the `</>` icon in the left sidebar, or search for "SQL" in the dashboard

### Buckets already exist
**Solution:** That's fine! You can skip creating them or delete and recreate

## Next Steps

Now that your database is set up, you can:
1. ✅ Proceed to **Task 2**: Implement enhanced cart functionality
2. ✅ Start building the reviews UI
3. ✅ Implement the checkout flow with shipping addresses
4. ✅ Add product search functionality

---

**Need Help?** Check `APPLY_MIGRATION_REMOTE.md` for more details or alternative methods.
