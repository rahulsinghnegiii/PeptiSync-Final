-- Verification script for database schema
-- Run this after applying migrations to verify everything is set up correctly

-- ============================================================================
-- 1. Verify all tables exist
-- ============================================================================
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 7 THEN '✓ PASS'
    ELSE '✗ FAIL - Expected 7 tables, found ' || COUNT(*)
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_roles', 'products', 'cart_items', 'orders', 'order_items', 'reviews');

-- ============================================================================
-- 2. Verify profiles table columns
-- ============================================================================
SELECT 
  'Profiles Columns' as check_type,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('id', 'user_id', 'full_name', 'email', 'avatar_url', 'membership_tier', 'shipping_address', 'created_at');

-- ============================================================================
-- 3. Verify products table columns
-- ============================================================================
SELECT 
  'Products Columns' as check_type,
  CASE 
    WHEN COUNT(*) >= 11 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name IN ('id', 'name', 'description', 'price', 'image_url', 'stock_quantity', 'category', 'is_active', 'rating', 'review_count', 'search_vector');

-- ============================================================================
-- 4. Verify cart_items has product_id
-- ============================================================================
SELECT 
  'Cart Items Product FK' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL - product_id column missing'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cart_items'
AND column_name = 'product_id';

-- ============================================================================
-- 5. Verify reviews table exists and has correct structure
-- ============================================================================
SELECT 
  'Reviews Table' as check_type,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✓ PASS'
    ELSE '✗ FAIL - Reviews table incomplete'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reviews'
AND column_name IN ('id', 'user_id', 'product_id', 'rating', 'comment', 'is_verified_purchase', 'created_at');

-- ============================================================================
-- 6. Verify orders table has payment_intent_id
-- ============================================================================
SELECT 
  'Orders Payment Intent' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL - payment_intent_id column missing'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name = 'payment_intent_id';

-- ============================================================================
-- 7. Verify order_items has product_id
-- ============================================================================
SELECT 
  'Order Items Product FK' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL - product_id column missing'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'order_items'
AND column_name = 'product_id';

-- ============================================================================
-- 8. Verify indexes exist
-- ============================================================================
SELECT 
  'Database Indexes' as check_type,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✓ PASS'
    ELSE '✗ FAIL - Expected at least 20 indexes, found ' || COUNT(*)
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- ============================================================================
-- 9. Verify RLS is enabled on all tables
-- ============================================================================
SELECT 
  'RLS Enabled' as check_type,
  CASE 
    WHEN COUNT(*) = 7 THEN '✓ PASS'
    ELSE '✗ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_roles', 'products', 'cart_items', 'orders', 'order_items', 'reviews')
AND rowsecurity = true;

-- ============================================================================
-- 10. Verify helper functions exist
-- ============================================================================
SELECT 
  'Helper Functions' as check_type,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing helper functions'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('has_role', 'user_purchased_product', 'update_product_rating', 'products_search_vector_update');

-- ============================================================================
-- 11. Verify triggers exist
-- ============================================================================
SELECT 
  'Database Triggers' as check_type,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing triggers'
  END as status
FROM pg_trigger
WHERE tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_%';

-- ============================================================================
-- 12. List all tables with row counts
-- ============================================================================
SELECT 
  'Table Inventory' as check_type,
  '✓ INFO' as status;

SELECT 
  schemaname,
  tablename,
  COALESCE((
    SELECT COUNT(*)::text 
    FROM (SELECT 1 FROM pg_class WHERE relname = tablename LIMIT 1) x
  ), '0') as estimated_rows
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- Summary
-- ============================================================================
SELECT 
  '=== VERIFICATION COMPLETE ===' as message,
  'Review results above' as note;
