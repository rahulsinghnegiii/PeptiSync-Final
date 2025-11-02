/**
 * Memory profiler utility for development monitoring
 * Tracks memory usage and detects potential leaks
 */

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

class MemoryProfiler {
  private isEnabled: boolean;
  private interval: NodeJS.Timeout | null = null;
  private stats: MemoryStats[] = [];
  private maxStats = 100; // Keep last 100 measurements
  private warningThreshold = 50 * 1024 * 1024; // 50MB
  private criticalThreshold = 100 * 1024 * 1024; // 100MB

  constructor() {
    this.isEnabled = import.meta.env.DEV && typeof performance !== 'undefined' && !!performance.memory;
  }

  start(intervalMs = 10000) {
    if (!this.isEnabled || this.interval) return;

    console.log('🔍 Memory profiler started');
    this.interval = setInterval(() => {
      this.recordStats();
    }, intervalMs);

    // Record initial stats
    this.recordStats();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🔍 Memory profiler stopped');
    }
  }

  private recordStats() {
    if (!this.isEnabled || !performance.memory) return;

    const stats: MemoryStats = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    this.stats.push(stats);

    // Keep only last maxStats measurements
    if (this.stats.length > this.maxStats) {
      this.stats.shift();
    }

    // Check for warnings
    this.checkThresholds(stats);

    // Log stats
    this.logStats(stats);
  }

  private checkThresholds(stats: MemoryStats) {
    const usedMB = stats.usedJSHeapSize / (1024 * 1024);

    if (stats.usedJSHeapSize > this.criticalThreshold) {
      console.error(`🚨 CRITICAL: Memory usage at ${usedMB.toFixed(2)}MB`);
    } else if (stats.usedJSHeapSize > this.warningThreshold) {
      console.warn(`⚠️ WARNING: Memory usage at ${usedMB.toFixed(2)}MB`);
    }

    // Check for memory leak (increasing trend)
    if (this.stats.length >= 5) {
      const recent = this.stats.slice(-5);
      const isIncreasing = recent.every((stat, i) => {
        if (i === 0) return true;
        return stat.usedJSHeapSize >= recent[i - 1].usedJSHeapSize;
      });

      if (isIncreasing) {
        const increase = recent[4].usedJSHeapSize - recent[0].usedJSHeapSize;
        const increaseMB = increase / (1024 * 1024);
        if (increaseMB > 10) {
          console.warn(`📈 Potential memory leak detected: +${increaseMB.toFixed(2)}MB over last 5 measurements`);
        }
      }
    }
  }

  private logStats(stats: MemoryStats) {
    const usedMB = (stats.usedJSHeapSize / (1024 * 1024)).toFixed(2);
    const totalMB = (stats.totalJSHeapSize / (1024 * 1024)).toFixed(2);
    const limitMB = (stats.jsHeapSizeLimit / (1024 * 1024)).toFixed(2);

    console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
  }

  getStats() {
    return this.stats;
  }

  getCurrentMemory() {
    if (!this.isEnabled || !performance.memory) return null;

    return {
      usedMB: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
      totalMB: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
      limitMB: (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2),
    };
  }

  reset() {
    this.stats = [];
  }
}

// Export singleton instance
export const memoryProfiler = new MemoryProfiler();

// Auto-start in development
if (import.meta.env.DEV) {
  memoryProfiler.start();
}
