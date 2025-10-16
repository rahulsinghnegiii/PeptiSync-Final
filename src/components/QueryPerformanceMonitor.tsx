/**
 * Query Performance Monitor Component
 * 
 * Admin component to view query performance metrics and identify slow queries.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPerformanceMetrics,
  getSlowestQueries,
  getAverageExecutionTime,
  clearPerformanceMetrics,
  exportPerformanceReport,
} from "@/lib/queryPerformance";
import { Download, RefreshCw, Trash2 } from "lucide-react";

export const QueryPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [slowestQueries, setSlowestQueries] = useState(getSlowestQueries(10));

  const refreshMetrics = () => {
    setMetrics(getPerformanceMetrics());
    setSlowestQueries(getSlowestQueries(10));
  };

  const handleClear = () => {
    clearPerformanceMetrics();
    refreshMetrics();
  };

  const handleExport = () => {
    const report = exportPerformanceReport();
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-performance-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Refresh metrics every 5 seconds
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalQueries = metrics.length;
  const averageTime =
    totalQueries > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + m.executionTimeMs, 0) / totalQueries
        )
      : 0;

  // Group queries by name
  const queryBreakdown = metrics.reduce((acc, m) => {
    if (!acc[m.queryName]) {
      acc[m.queryName] = {
        count: 0,
        totalTime: 0,
      };
    }
    acc[m.queryName].count++;
    acc[m.queryName].totalTime += m.executionTimeMs;
    return acc;
  }, {} as Record<string, { count: number; totalTime: number }>);

  const getPerformanceBadge = (timeMs: number) => {
    if (timeMs < 100) return <Badge variant="default">Fast</Badge>;
    if (timeMs < 500) return <Badge variant="secondary">Good</Badge>;
    if (timeMs < 1000) return <Badge variant="outline">Slow</Badge>;
    return <Badge variant="destructive">Very Slow</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Query Performance Monitor</h2>
          <p className="text-muted-foreground">
            Monitor and analyze database query performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              Queries tracked in session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average query execution time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.filter((m) => m.executionTimeMs > 1000).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Queries taking over 1 second
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Slowest Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Slowest Queries</CardTitle>
          <CardDescription>
            Top 10 slowest queries in the current session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slowestQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queries tracked yet</p>
          ) : (
            <div className="space-y-4">
              {slowestQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{query.queryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {query.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {query.executionTimeMs}ms
                    </span>
                    {getPerformanceBadge(query.executionTimeMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Query Breakdown</CardTitle>
          <CardDescription>
            Performance statistics by query type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(queryBreakdown).length === 0 ? (
            <p className="text-sm text-muted-foreground">No queries tracked yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(queryBreakdown)
                .sort((a, b) => b[1].totalTime - a[1].totalTime)
                .map(([name, stats]) => {
                  const avgTime = Math.round(stats.totalTime / stats.count);
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.count} queries • Avg: {avgTime}ms
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          Total: {stats.totalTime}ms
                        </span>
                        {getPerformanceBadge(avgTime)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
