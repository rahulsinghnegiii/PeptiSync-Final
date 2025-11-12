# Performance Optimization Guide

This document outlines the performance optimizations implemented in the PeptiSync application.

## Overview

Task 11.3 implements comprehensive database and query optimizations to improve application performance, reduce load times, and provide better user experience.

## Implemented Optimizations

### 1. Database Indexes

#### Composite Indexes
Created composite indexes for common query patterns to improve query performance:

- `idx_products_category_active_price` - For filtering products by category with price sorting
- `idx_products_active_rating` - For filtering active products with rating sorting
- `idx_orders_user_status_created` - For user order history queries
- `idx_order_items_order_product` - For efficient order item joins
- `idx_reviews_product_rating_created` - For product reviews with sorting
- `idx_cart_items_user_created` - For efficient cart queries

#### Partial Indexes
Created partial indexes for specific query patterns to reduce index size and improve performance:

- `idx_products_low_stock` - For admin low stock alerts (stock < 10)
- `idx_products_out_of_stock` - For out of stock products
- `idx_orders_active_status` - For pending/processing orders
- `idx_orders_recent` - For recent orders (last 30 days)
- `idx_reviews_verified` - For verified purchase reviews

#### Full-Text Search Index
- `idx_products_search_vector` - GIN index for full-text search on products

### 2. Query Optimization

#### Column Selection
Updated all queries to select only needed columns instead of using `SELECT *`:

**Before:**
```typescript
.select("*")
```

**After:**
```typescript
.select("id, name, description, price, image_url, stock_quantity, category, rating, review_count")
```

This reduces data transfer and improves query performance.

#### Pagination
Implemented pagination for large datasets:

- Products: 20 items per page
- Reviews: 10 items per page
- Orders: Configurable page size

**Benefits:**
- Reduced initial load time
- Lower memory usage
- Better user experience with faster page loads

### 3. React Query Caching Strategy

Configured optimized caching strategy in `src/App.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: 1,                         // Retry once on failure
      refetchOnWindowFocus: false,      // Don't refetch on focus
      refetchOnMount: true,             // Refetch if stale
      refetchOnReconnect: false,        // Don't refetch on reconnect
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Benefits:**
- Reduced unnecessary API calls
- Faster perceived performance
- Lower server load

### 4. Performance Monitoring

#### Query Performance Tracking
Created `src/lib/queryPerformance.ts` utility for tracking query performance:

- Measures execution time for all queries
- Logs slow queries (> 1000ms) to database
- Provides in-memory metrics for analysis
- Exports performance reports

#### Performance Monitor Component
Created `src/components/QueryPerformanceMonitor.tsx` for admins:

- Real-time query performance metrics
- Slowest queries identification
- Query breakdown by type
- Export performance reports

#### Optimized Query Hook
Created `src/hooks/useOptimizedQuery.ts`:

- Wraps `useQuery` with performance monitoring
- Configurable caching based on data volatility
- Automatic performance logging

### 5. Materialized Views

Created materialized view for analytics queries:

```sql
CREATE MATERIALIZED VIEW product_sales_stats AS
SELECT 
  p.id,
  p.name,
  p.category,
  COALESCE(SUM(oi.quantity), 0) AS total_sold,
  COALESCE(SUM(oi.quantity * oi.product_price), 0) AS total_revenue,
  COUNT(DISTINCT oi.order_id) AS order_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id;
```

**Benefits:**
- Pre-computed analytics data
- Faster dashboard load times
- Reduced database load

**Refresh Strategy:**
- Manual refresh via `refresh_product_sales_stats()` function
- Can be scheduled via cron job or trigger

### 6. Database Query Performance Logging

Created `query_performance_log` table to track slow queries:

- Automatically logs queries taking > 100ms
- Stores query name, execution time, user, and parameters
- Admin-only access via RLS policies

## Performance Metrics

### Expected Improvements

1. **Product Listing Page**
   - Before: ~500-800ms
   - After: ~100-200ms
   - Improvement: 60-75% faster

2. **Cart Operations**
   - Before: ~300-500ms
   - After: ~50-100ms
   - Improvement: 80% faster

3. **Order History**
   - Before: ~600-1000ms
   - After: ~150-300ms
   - Improvement: 70% faster

4. **Analytics Dashboard**
   - Before: ~2000-3000ms
   - After: ~500-800ms (with materialized view)
   - Improvement: 70-75% faster

## Usage

### For Developers

#### Using Optimized Query Hook
```typescript
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";

const { data, isLoading } = useOptimizedQuery({
  queryKey: ["products", filters],
  queryFn: async () => fetchProducts(filters),
  queryName: "fetch-products",
  dataVolatility: "medium", // high | medium | low
});
```

#### Measuring Query Performance
```typescript
import { measureQueryPerformance } from "@/lib/queryPerformance";

const result = await measureQueryPerformance(
  "fetch-user-orders",
  async () => {
    return await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId);
  },
  { userId }
);
```

### For Admins

#### Viewing Performance Metrics
1. Navigate to Admin Panel
2. Add the QueryPerformanceMonitor component to view metrics
3. Monitor slow queries and optimize as needed

#### Refreshing Materialized Views
```sql
SELECT refresh_product_sales_stats();
```

Or via Supabase dashboard SQL editor.

## Best Practices

### Query Optimization
1. Always select only needed columns
2. Use indexes for frequently queried columns
3. Implement pagination for large datasets
4. Use materialized views for complex analytics

### Caching Strategy
1. Set appropriate `staleTime` based on data volatility:
   - High volatility (cart, orders): 1 minute
   - Medium volatility (products): 5 minutes
   - Low volatility (categories, settings): 15 minutes

2. Use `placeholderData` for pagination to keep previous data while loading

### Performance Monitoring
1. Monitor slow queries regularly
2. Export performance reports for analysis
3. Optimize queries taking > 500ms
4. Review and update indexes based on query patterns

## Maintenance

### Regular Tasks

1. **Analyze Tables** (Weekly)
   ```sql
   ANALYZE public.products;
   ANALYZE public.orders;
   ANALYZE public.order_items;
   ```

2. **Refresh Materialized Views** (Daily)
   ```sql
   SELECT refresh_product_sales_stats();
   ```

3. **Review Performance Logs** (Weekly)
   ```sql
   SELECT query_name, AVG(execution_time_ms) as avg_time, COUNT(*) as count
   FROM query_performance_log
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY query_name
   ORDER BY avg_time DESC;
   ```

4. **Clean Old Performance Logs** (Monthly)
   ```sql
   DELETE FROM query_performance_log
   WHERE created_at < NOW() - INTERVAL '30 days';
   ```

## Troubleshooting

### Slow Queries
1. Check if indexes are being used:
   ```sql
   EXPLAIN ANALYZE SELECT ...;
   ```

2. Review query execution plan
3. Add missing indexes if needed
4. Consider query rewriting

### High Memory Usage
1. Reduce page size for pagination
2. Increase `gcTime` to cache less data
3. Review and optimize large queries

### Stale Data
1. Reduce `staleTime` for frequently changing data
2. Use `refetchInterval` for real-time data
3. Manually invalidate queries when needed

## Future Improvements

1. **Database Connection Pooling**
   - Configure optimal pool size
   - Monitor connection usage

2. **CDN Integration**
   - Cache static assets
   - Serve images from CDN

3. **Server-Side Rendering**
   - Pre-render product pages
   - Improve initial load time

4. **Database Partitioning**
   - Partition large tables by date
   - Improve query performance on historical data

5. **Query Result Caching**
   - Implement Redis for frequently accessed data
   - Cache analytics results

## References

- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [React Query Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
