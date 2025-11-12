/**
 * Memory Management Utility
 * 
 * Provides utilities for monitoring and managing memory usage
 * to prevent memory leaks in production
 */

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

class MemoryManager {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly WARNING_THRESHOLD = 100 * 1024 * 1024; // 100MB
  private readonly CRITICAL_THRESHOLD = 200 * 1024 * 1024; // 200MB
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute

  /**
   * Start monitoring memory usage
   */
  startMonitoring() {
    if (this.checkInterval || typeof window === 'undefined' || !performance.memory) {
      return;
    }

    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.CHECK_INTERVAL);

    // Initial check
    this.checkMemoryUsage();
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check current memory usage and log warnings if needed
   */
  private checkMemoryUsage() {
    if (!performance.memory) return;

    const stats: MemoryStats = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    const usedMB = stats.usedJSHeapSize / (1024 * 1024);
    const limitMB = stats.jsHeapSizeLimit / (1024 * 1024);
    const usagePercent = (stats.usedJSHeapSize / stats.jsHeapSizeLimit) * 100;

    // Log warning if memory usage is high
    if (stats.usedJSHeapSize > this.CRITICAL_THRESHOLD) {
      console.error(
        `🚨 CRITICAL: Memory usage at ${usedMB.toFixed(2)}MB (${usagePercent.toFixed(1)}% of ${limitMB.toFixed(2)}MB limit)`
      );
      
      // Try to trigger garbage collection if available
      this.triggerGarbageCollection();
    } else if (stats.usedJSHeapSize > this.WARNING_THRESHOLD) {
      console.warn(
        `⚠️ WARNING: Memory usage at ${usedMB.toFixed(2)}MB (${usagePercent.toFixed(1)}% of ${limitMB.toFixed(2)}MB limit)`
      );
    }
  }

  /**
   * Get current memory stats
   */
  getMemoryStats(): MemoryStats | null {
    if (!performance.memory) return null;

    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }

  /**
   * Trigger garbage collection if available (Chrome DevTools)
   */
  private triggerGarbageCollection() {
    // This only works in Chrome DevTools with "Collect garbage" button
    // In production, we can't force GC, but we can clear caches
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Clear various caches to free memory
   */
  clearCaches() {
    // Clear React Query cache if available
    try {
      const { queryClient } = require('@/App');
      if (queryClient) {
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.getAll();
        
        // Remove inactive queries
        queries.forEach(query => {
          if (query.getObserversCount() === 0) {
            queryCache.remove(query);
          }
        });
      }
    } catch (error) {
      // Query client not available, skip
    }

    // Clear performance metrics
    try {
      const { clearPerformanceMetrics } = require('@/lib/queryPerformance');
      clearPerformanceMetrics();
    } catch (error) {
      // Performance metrics not available, skip
    }
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Auto-start monitoring in production (can be disabled if needed)
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  // Only start in production if memory API is available
  if (performance.memory) {
    memoryManager.startMonitoring();
  }
}

