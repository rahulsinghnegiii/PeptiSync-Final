-- Migration: Performance optimization - Additional indexes and query optimization
-- This migration adds additional indexes for query optimization and performance monitoring

-- ============================================================================
-- 1. Add composite indexes for common query patterns
-- ============================================================================

-- Composite index for products filtering by category and active status with price sorting
CREATE INDEX IF NOT EXISTS idx_products_category_active_price 
ON public.products(category, is_active, price) 
WHERE is_active = true;

-- Composite index for products filtering by active status with rating sorting
CREATE INDEX IF NOT EXISTS idx_products_active_rating 
ON public.products(is_active, rating DESC) 
WHERE is_active = true;

-- Composite index for orders by user and status for dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON public.orders(user_id, status, created_at DESC);

-- Composite index for order_items with order_id for efficient joins
CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
ON public.order_items(order_id, product_id);

-- Composite index for reviews by product with rating for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating_created 
ON public.reviews(product_id, rating DESC, created_at DESC);

-- Composite index for cart_items by user for efficient cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_created 
ON public.cart_items(user_id, created_at DESC);

-- ============================================================================
-- 2. Add partial indexes for specific query patterns
-- ============================================================================

-- Partial index for low stock products (admin alerts)
CREATE INDEX IF NOT EXISTS idx_products_low_stock 
ON public.products(stock_quantity, name) 
WHERE is_active = true AND stock_quantity < 10;

-- Partial index for out of stock products
CREATE INDEX IF NOT EXISTS idx_products_out_of_stock 
ON public.products(id, name) 
WHERE is_active = true AND stock_quantity = 0;

-- Partial index for pending and processing orders (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_active_status 
ON public.orders(status, created_at DESC) 
WHERE status IN ('pending', 'processing');

-- Partial index for recent orders (last 30 days) - removed due to NOW() not being immutable
-- Use a regular index instead
CREATE INDEX IF NOT EXISTS idx_orders_recent 
ON public.orders(created_at DESC, user_id);

-- Partial index for verified purchase reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified 
ON public.reviews(product_id, created_at DESC) 
WHERE is_verified_purchase = true;

-- ============================================================================
-- 3. Create materialized view for analytics (optional, for heavy queries)
-- ============================================================================

-- Materialized view for product sales statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS product_sales_stats AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock_quantity,
  p.rating,
  p.review_count,
  COALESCE(SUM(oi.quantity), 0) AS total_sold,
  COALESCE(SUM(oi.quantity * oi.product_price), 0) AS total_revenue,
  COUNT(DISTINCT oi.order_id) AS order_count
FROM public.products p
LEFT JOIN public.order_items oi ON oi.product_id = p.id
LEFT JOIN public.orders o ON o.id = oi.order_id AND o.status != 'cancelled'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity, p.rating, p.review_count;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_product_sales_stats_revenue 
ON product_sales_stats(total_revenue DESC);

CREATE INDEX IF NOT EXISTS idx_product_sales_stats_sold 
ON product_sales_stats(total_sold DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_product_sales_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_sales_stats;
END;
$$;

-- ============================================================================
-- 4. Add query performance monitoring function
-- ============================================================================

-- Create table to log slow queries (optional)
CREATE TABLE IF NOT EXISTS public.query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance log queries
CREATE INDEX IF NOT EXISTS idx_query_performance_log_created 
ON public.query_performance_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_query_name 
ON public.query_performance_log(query_name, execution_time_ms DESC);

-- Enable RLS on performance log
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view performance logs
CREATE POLICY "Admins can view performance logs"
ON public.query_performance_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log query performance
CREATE OR REPLACE FUNCTION log_query_performance(
  p_query_name TEXT,
  p_execution_time_ms INTEGER,
  p_user_id UUID DEFAULT NULL,
  p_query_params JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if execution time is over 100ms
  IF p_execution_time_ms > 100 THEN
    INSERT INTO public.query_performance_log (
      query_name,
      execution_time_ms,
      user_id,
      query_params
    ) VALUES (
      p_query_name,
      p_execution_time_ms,
      p_user_id,
      p_query_params
    );
  END IF;
END;
$$;

-- ============================================================================
-- 5. Optimize existing queries with better indexes
-- ============================================================================

-- Add covering index for cart items with all frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_cart_items_user_covering 
ON public.cart_items(user_id, product_id, quantity, created_at);

-- Add index for products search with category filter
-- Note: GIN index only on search_vector, separate B-tree index on category
CREATE INDEX IF NOT EXISTS idx_products_search_active 
ON public.products USING GIN(search_vector) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON public.products(category) 
WHERE is_active = true;

-- ============================================================================
-- 6. Add statistics collection for query planner
-- ============================================================================

-- Analyze tables to update statistics for query planner
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.cart_items;
ANALYZE public.reviews;
ANALYZE public.profiles;

-- ============================================================================
-- 7. Create helper function for paginated queries
-- ============================================================================

-- Function to get total count efficiently
CREATE OR REPLACE FUNCTION get_products_count(
  p_category TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.products
  WHERE is_active = true
    AND (p_category IS NULL OR category = p_category)
    AND (p_min_price IS NULL OR price >= p_min_price)
    AND (p_max_price IS NULL OR price <= p_max_price)
    AND (p_min_rating IS NULL OR rating >= p_min_rating)
    AND (p_search_query IS NULL OR search_vector @@ websearch_to_tsquery('english', p_search_query));
  
  RETURN v_count;
END;
$$;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Add comment
COMMENT ON MATERIALIZED VIEW product_sales_stats IS 'Materialized view for product sales analytics - refresh periodically';
COMMENT ON FUNCTION refresh_product_sales_stats() IS 'Refresh product sales statistics materialized view';
COMMENT ON FUNCTION log_query_performance IS 'Log slow query performance for monitoring';
COMMENT ON TABLE query_performance_log IS 'Log of slow queries for performance monitoring';
