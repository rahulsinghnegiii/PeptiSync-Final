# Performance Monitoring Usage Guide

Quick reference guide for using the performance monitoring features implemented in Task 11.3.

## For Developers

### Using the Optimized Query Hook

Replace standard `useQuery` with `useOptimizedQuery` for automatic performance monitoring:

```typescript
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";

// Instead of useQuery
const { data, isLoading } = useOptimizedQuery({
  queryKey: ["products", filters],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .eq("is_active", true);
    
    if (error) throw error;
    return data;
  },
  queryName: "fetch-products", // Optional: for better tracking
  dataVolatility: "medium", // high | medium | low
});
```

### Data Volatility Levels

Choose the appropriate volatility level for your data:

- **high** (1 min cache): Cart items, active orders, real-time data
- **medium** (5 min cache): Products, reviews, user profiles
- **low** (15 min cache): Categories, settings, static content

### Manual Performance Measurement

For non-React Query operations:

```typescript
import { measureQueryPerformance } from "@/lib/queryPerformance";

const result = await measureQueryPerformance(
  "custom-operation",
  async () => {
    // Your async operation here
    return await someAsyncFunction();
  },
  { param1: "value1" } // Optional: query parameters for logging
);
```

### Pagination Implementation

Use the updated `useProducts` hook with pagination:

```typescript
import { useProducts } from "@/hooks/useProducts";

const [currentPage, setCurrentPage] = useState(1);
const pageSize = 20;

const { data, isLoading } = useProducts({
  filters,
  sortBy,
  searchQuery,
  page: currentPage,
  pageSize,
});

// Access pagination data
const products = data?.products || [];
const totalPages = data?.totalPages || 1;
const totalCount = data?.totalCount || 0;
```

## For Admins

### Viewing Performance Metrics

Add the QueryPerformanceMonitor component to your admin panel:

```typescript
import { QueryPerformanceMonitor } from "@/components/QueryPerformanceMonitor";

// In your admin component
<QueryPerformanceMonitor />
```

### Understanding Metrics

**Performance Badges:**
- 🟢 **Fast** (< 100ms): Excellent performance
- 🔵 **Good** (100-500ms): Acceptable performance
- ⚪ **Slow** (500-1000ms): Needs attention
- 🔴 **Very Slow** (> 1000ms): Requires optimization

**Key Metrics:**
- **Total Queries**: Number of queries tracked in current session
- **Average Time**: Average execution time across all queries
- **Slow Queries**: Queries taking over 1 second

### Exporting Performance Reports

1. Click the "Export" button in QueryPerformanceMonitor
2. Save the JSON file
3. Analyze the report:

```json
{
  "totalQueries": 150,
  "averageExecutionTime": 245,
  "slowestQueries": [...],
  "queryBreakdown": [
    {
      "queryName": "fetch-products",
      "count": 45,
      "averageTime": 180
    }
  ]
}
```

### Database Performance Logs

Query slow queries from the database:

```sql
-- View all slow queries from last 7 days
SELECT 
  query_name,
  AVG(execution_time_ms) as avg_time,
  MAX(execution_time_ms) as max_time,
  COUNT(*) as count
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query_name
ORDER BY avg_time DESC;

-- View slowest individual queries
SELECT 
  query_name,
  execution_time_ms,
  query_params,
  created_at
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY execution_time_ms DESC
LIMIT 20;
```

## Database Maintenance

### Daily Tasks

**Refresh Materialized Views:**
```sql
SELECT refresh_product_sales_stats();
```

Or via Supabase dashboard:
1. Go to SQL Editor
2. Run the refresh function
3. Verify completion

### Weekly Tasks

**Analyze Tables:**
```sql
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.cart_items;
ANALYZE public.reviews;
```

**Review Performance Logs:**
```sql
-- Get weekly performance summary
SELECT 
  query_name,
  COUNT(*) as executions,
  AVG(execution_time_ms) as avg_time,
  MAX(execution_time_ms) as max_time,
  MIN(execution_time_ms) as min_time
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query_name
ORDER BY avg_time DESC;
```

### Monthly Tasks

**Clean Old Logs:**
```sql
DELETE FROM query_performance_log
WHERE created_at < NOW() - INTERVAL '30 days';
```

**Review Index Usage:**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Optimization Workflow

### 1. Identify Slow Queries

Use QueryPerformanceMonitor or database logs:

```sql
SELECT query_name, AVG(execution_time_ms) as avg_time
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query_name
HAVING AVG(execution_time_ms) > 500
ORDER BY avg_time DESC;
```

### 2. Analyze Query Execution

Use EXPLAIN ANALYZE to understand query performance:

```sql
EXPLAIN ANALYZE
SELECT id, name, price
FROM products
WHERE is_active = true
  AND category = 'Peptides'
ORDER BY rating DESC
LIMIT 20;
```

Look for:
- Sequential scans (should use indexes)
- High execution time
- Large row counts

### 3. Add or Modify Indexes

If needed, create new indexes:

```sql
-- Example: Add index for specific query pattern
CREATE INDEX idx_custom_query 
ON products(category, is_active, rating DESC)
WHERE is_active = true;
```

### 4. Verify Improvement

Re-run EXPLAIN ANALYZE and compare:
- Execution time should decrease
- Should use index scan instead of sequential scan
- Fewer rows processed

### 5. Monitor in Production

Continue monitoring with QueryPerformanceMonitor to ensure sustained improvement.

## Common Issues and Solutions

### Issue: Queries Still Slow After Adding Indexes

**Solution:**
1. Verify index is being used: `EXPLAIN ANALYZE your_query`
2. Check if statistics are up to date: `ANALYZE table_name`
3. Consider query rewriting or additional indexes

### Issue: High Memory Usage

**Solution:**
1. Reduce page size for pagination
2. Increase `gcTime` in React Query config
3. Clear performance metrics: `clearPerformanceMetrics()`

### Issue: Stale Data Displayed

**Solution:**
1. Reduce `staleTime` for that specific query
2. Manually invalidate: `queryClient.invalidateQueries(['key'])`
3. Use `refetchInterval` for real-time data

### Issue: Too Many Database Connections

**Solution:**
1. Review connection pooling settings
2. Ensure queries are properly closed
3. Check for connection leaks in code

## Performance Targets

### Target Response Times

- **Product Listing**: < 200ms
- **Cart Operations**: < 100ms
- **Order History**: < 300ms
- **Analytics Dashboard**: < 800ms
- **Search**: < 250ms

### When to Optimize

Optimize queries that:
- Take > 500ms consistently
- Are called frequently (> 100 times/day)
- Impact user experience
- Show up in slow query logs

## Best Practices

### DO ✅

- Use specific column selection
- Implement pagination for large datasets
- Set appropriate cache times based on data volatility
- Monitor performance regularly
- Keep indexes up to date
- Analyze tables weekly

### DON'T ❌

- Use `SELECT *` in production queries
- Load all data without pagination
- Set very short cache times unnecessarily
- Ignore slow query warnings
- Create indexes without testing
- Forget to refresh materialized views

## Resources

- [Performance Optimization Guide](../PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [Task 11.3 Implementation Summary](../TASK_11.3_IMPLEMENTATION_SUMMARY.md)
- [Verification Script](../scripts/verify-performance-optimization.sql)

## Support

For issues or questions:
1. Check the troubleshooting section in PERFORMANCE_OPTIMIZATION_GUIDE.md
2. Review slow query logs
3. Export performance report for analysis
4. Consult with database administrator if needed
