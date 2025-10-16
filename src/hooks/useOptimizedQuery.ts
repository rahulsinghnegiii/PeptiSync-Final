/**
 * Optimized Query Hook
 * 
 * A wrapper around useQuery that adds performance monitoring
 * and optimized caching strategies.
 */

import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { measureQueryPerformance } from "@/lib/queryPerformance";

interface UseOptimizedQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  queryName?: string;
  // Custom stale time based on data volatility
  dataVolatility?: "high" | "medium" | "low";
}

/**
 * Hook that wraps useQuery with performance monitoring and optimized caching
 */
export const useOptimizedQuery = <TData, TError = Error>({
  queryKey,
  queryFn,
  queryName,
  dataVolatility = "medium",
  ...options
}: UseOptimizedQueryOptions<TData, TError>) => {
  // Determine stale time based on data volatility
  const getStaleTime = () => {
    switch (dataVolatility) {
      case "high":
        return 1 * 60 * 1000; // 1 minute for frequently changing data
      case "medium":
        return 5 * 60 * 1000; // 5 minutes for moderately changing data
      case "low":
        return 15 * 60 * 1000; // 15 minutes for rarely changing data
      default:
        return 5 * 60 * 1000;
    }
  };

  // Wrap query function with performance monitoring
  const monitoredQueryFn = async () => {
    const name = queryName || (Array.isArray(queryKey) ? queryKey[0] : String(queryKey));
    return measureQueryPerformance(String(name), queryFn, {
      queryKey: JSON.stringify(queryKey),
    });
  };

  return useQuery<TData, TError>({
    queryKey,
    queryFn: monitoredQueryFn,
    staleTime: getStaleTime(),
    gcTime: getStaleTime() * 2, // Keep in cache for 2x stale time
    ...options,
  });
};
