-- Simple verification query to run in Supabase Dashboard SQL Editor
-- This checks if the migration was applied successfully

-- 1. Check all required tables exist
SELECT 
  'Tables Check' as check_name,
  COUNT(*) as found,
  '7 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_roles', 'products', 'cart_items', 'orders', 'order_items', 'reviews');

-- 2. Check reviews table structure
SELECT 
  'Reviews Table Columns' as check_name,
  COUNT(*) as found,
  '8 expected' as expected
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reviews';

-- 3. Check new columns in profiles
SELECT 
  'Profiles - shipping_address' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'shipping_address';

-- 4. Check new columns in products
SELECT 
  'Products - rating column' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name = 'rating';

SELECT 
  'Products - review_count column' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name = 'review_count';

SELECT 
  'Products - search_vector column' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name = 'search_vector';

-- 5. Check cart_items has product_id
SELECT 
  'Cart Items - product_id' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cart_items'
AND column_name = 'product_id';

-- 6. Check orders has payment_intent_id
SELECT 
  'Orders - payment_intent_id' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name = 'payment_intent_id';

-- 7. Check order_items has product_id
SELECT 
  'Order Items - product_id' as check_name,
  CASE WHEN COUNT(*) = 1 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'order_items'
AND column_name = 'product_id';

-- 8. Check indexes were created
SELECT 
  'Database Indexes' as check_name,
  COUNT(*) as found,
  'Should be 20+' as expected
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- 9. Check helper functions exist
SELECT 
  'Helper Functions' as check_name,
  COUNT(*) as found,
  '4 expected' as expected
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('has_role', 'user_purchased_product', 'update_product_rating', 'products_search_vector_update');

-- 10. Final summary
SELECT 
  '=== MIGRATION STATUS ===' as summary,
  'If all checks show ✓ EXISTS or correct counts, migration is successful!' as result;
