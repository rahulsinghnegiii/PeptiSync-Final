/**
 * Query Performance Monitoring Utility
 * 
 * This utility helps track and log query performance for optimization purposes.
 * It can be used to identify slow queries and optimize them.
 */

import { supabase } from "@/integrations/supabase/client";

interface QueryPerformanceMetrics {
  queryName: string;
  executionTimeMs: number;
  timestamp: Date;
  queryParams?: Record<string, any>;
}

// In-memory store for performance metrics (client-side only)
const performanceMetrics: QueryPerformanceMetrics[] = [];
const MAX_METRICS_STORED = 50; // Reduced from 100 to save memory
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Clean up old metrics every 10 minutes

// Automatic cleanup of old metrics to prevent memory buildup
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // Keep metrics for 30 minutes max
    
    // Remove metrics older than maxAge
    const filtered = performanceMetrics.filter(
      metric => now - metric.timestamp.getTime() < maxAge
    );
    
    // Clear array and repopulate
    performanceMetrics.length = 0;
    performanceMetrics.push(...filtered);
    
    // Also enforce max size limit
    if (performanceMetrics.length > MAX_METRICS_STORED) {
      performanceMetrics.splice(0, performanceMetrics.length - MAX_METRICS_STORED);
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Measure query execution time
 */
export const measureQueryPerformance = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
  queryParams?: Record<string, any>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const executionTimeMs = Math.round(performance.now() - startTime);
    
    // Log performance metrics
    logPerformanceMetric({
      queryName,
      executionTimeMs,
      timestamp: new Date(),
      queryParams,
    });
    
    // Log to database if query is slow (> 1000ms)
    if (executionTimeMs > 1000) {
      logSlowQueryToDatabase(queryName, executionTimeMs, queryParams);
    }
    
    return result;
  } catch (error) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    
    // Log failed query performance
    logPerformanceMetric({
      queryName: `${queryName} (failed)`,
      executionTimeMs,
      timestamp: new Date(),
      queryParams,
    });
    
    throw error;
  }
};

/**
 * Log performance metric to in-memory store
 */
const logPerformanceMetric = (metric: QueryPerformanceMetrics) => {
  performanceMetrics.push(metric);
  
  // Keep only the last MAX_METRICS_STORED metrics
  if (performanceMetrics.length > MAX_METRICS_STORED) {
    performanceMetrics.shift();
  }
  
  // Log to console in development
  if (import.meta.env.DEV && metric.executionTimeMs > 500) {
    console.warn(
      `[Query Performance] ${metric.queryName} took ${metric.executionTimeMs}ms`,
      metric.queryParams
    );
  }
};

/**
 * Log slow query to database for admin monitoring
 */
const logSlowQueryToDatabase = async (
  queryName: string,
  executionTimeMs: number,
  queryParams?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.rpc("log_query_performance", {
      p_query_name: queryName,
      p_execution_time_ms: executionTimeMs,
      p_user_id: user?.id || null,
      p_query_params: queryParams || null,
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error("Failed to log query performance:", error);
  }
};

/**
 * Get performance metrics for analysis
 */
export const getPerformanceMetrics = (): QueryPerformanceMetrics[] => {
  return [...performanceMetrics];
};

/**
 * Get average execution time for a specific query
 */
export const getAverageExecutionTime = (queryName: string): number => {
  const metrics = performanceMetrics.filter((m) => m.queryName === queryName);
  
  if (metrics.length === 0) return 0;
  
  const total = metrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
  return Math.round(total / metrics.length);
};

/**
 * Get slowest queries
 */
export const getSlowestQueries = (limit: number = 10): QueryPerformanceMetrics[] => {
  return [...performanceMetrics]
    .sort((a, b) => b.executionTimeMs - a.executionTimeMs)
    .slice(0, limit);
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
};

/**
 * Export performance report
 */
export const exportPerformanceReport = (): string => {
  const report = {
    totalQueries: performanceMetrics.length,
    averageExecutionTime: Math.round(
      performanceMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0) /
        performanceMetrics.length
    ),
    slowestQueries: getSlowestQueries(5),
    queryBreakdown: Object.entries(
      performanceMetrics.reduce((acc, m) => {
        acc[m.queryName] = (acc[m.queryName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({
      queryName: name,
      count,
      averageTime: getAverageExecutionTime(name),
    })),
  };
  
  return JSON.stringify(report, null, 2);
};
