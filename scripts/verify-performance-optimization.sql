-- Verification Script for Performance Optimization (Task 11.3)
-- Run this script to verify all indexes and optimizations are in place

-- ============================================================================
-- 1. Verify Indexes
-- ============================================================================

SELECT 
  'Indexes Verification' as check_type,
  COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews', 'profiles', 'user_roles');

-- List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews', 'profiles', 'user_roles')
ORDER BY tablename, indexname;

-- ============================================================================
-- 2. Verify Materialized View
-- ============================================================================

SELECT 
  'Materialized View Verification' as check_type,
  COUNT(*) as exists
FROM pg_matviews 
WHERE schemaname = 'public' 
  AND matviewname = 'product_sales_stats';

-- Check materialized view data
SELECT 
  'Sample Data from Materialized View' as check_type,
  COUNT(*) as total_products
FROM product_sales_stats;

-- ============================================================================
-- 3. Verify Performance Log Table
-- ============================================================================

SELECT 
  'Performance Log Table Verification' as check_type,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'query_performance_log'
  ) as table_exists;

-- ============================================================================
-- 4. Verify Functions
-- ============================================================================

SELECT 
  'Functions Verification' as check_type,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname IN ('refresh_product_sales_stats', 'log_query_performance', 'get_products_count')
  AND pronamespace = 'public'::regnamespace;

-- ============================================================================
-- 5. Test Query Performance (Products)
-- ============================================================================

-- Test product query with filters
EXPLAIN ANALYZE
SELECT id, name, description, price, image_url, stock_quantity, category, rating, review_count
FROM public.products
WHERE is_active = true
  AND category = 'Peptides'
  AND price BETWEEN 50 AND 150
ORDER BY rating DESC
LIMIT 20;

-- ============================================================================
-- 6. Test Query Performance (Orders)
-- ============================================================================

-- Test order query for user
EXPLAIN ANALYZE
SELECT id, status, total_amount, created_at
FROM public.orders
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 7. Test Query Performance (Cart)
-- ============================================================================

-- Test cart query
EXPLAIN ANALYZE
SELECT 
  ci.*,
  p.id, p.name, p.price, p.image_url, p.stock_quantity, p.is_active
FROM public.cart_items ci
LEFT JOIN public.products p ON p.id = ci.product_id
WHERE ci.user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY ci.created_at DESC;

-- ============================================================================
-- 8. Test Full-Text Search
-- ============================================================================

-- Test product search
EXPLAIN ANALYZE
SELECT id, name, description, price, image_url, stock_quantity, category, rating, review_count
FROM public.products
WHERE is_active = true
  AND search_vector @@ websearch_to_tsquery('english', 'peptide tracking')
ORDER BY rating DESC
LIMIT 20;

-- ============================================================================
-- 9. Check Index Usage Statistics
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews')
ORDER BY idx_scan DESC;

-- ============================================================================
-- 10. Check Table Statistics
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews')
ORDER BY n_live_tup DESC;

-- ============================================================================
-- 11. Performance Recommendations
-- ============================================================================

-- Check for missing indexes (tables with sequential scans)
SELECT 
  schemaname,
  tablename,
  seq_scan as sequential_scans,
  seq_tup_read as rows_read_sequentially,
  idx_scan as index_scans,
  CASE 
    WHEN seq_scan > 0 AND idx_scan = 0 THEN 'Consider adding indexes'
    WHEN seq_scan > idx_scan THEN 'Review query patterns'
    ELSE 'Good'
  END as recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews')
ORDER BY seq_scan DESC;

-- ============================================================================
-- 12. Summary Report
-- ============================================================================

SELECT 
  'Performance Optimization Summary' as report_type,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('products', 'orders', 'order_items', 'cart_items', 'reviews')) as total_indexes,
  (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'product_sales_stats') as materialized_views,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('refresh_product_sales_stats', 'log_query_performance') AND pronamespace = 'public'::regnamespace) as helper_functions,
  (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'query_performance_log')) as performance_logging_enabled;

-- ============================================================================
-- Verification Complete
-- ============================================================================

SELECT 'Verification script completed successfully!' as status;
