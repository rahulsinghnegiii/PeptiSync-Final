/**
 * Scraper Monitoring Tab
 * 
 * Displays scraper job history with manual trigger button
 */

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Loader2, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import { useScraperJobs } from '@/hooks/useScraperJobs';
import { useTriggerScrapers } from '@/hooks/useTriggerScrapers';
import { useCancelScraperJob } from '@/hooks/useCancelScraperJob';
import { ScraperJob } from '@/types/scraperMonitoring';
import { toast } from 'sonner';
import { ScraperJobDetailsDialog } from './ScraperJobDetailsDialog';

/**
 * Format timestamp helper
 */
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  
  try {
    if (timestamp._seconds !== undefined) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleString();
    }
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Calculate duration in human-readable format
 */
function calculateDuration(start: any, end: any): string {
  if (!start) return '-';
  if (!end) return 'Running...';
  
  try {
    const startMs = start._seconds ? start._seconds * 1000 : start.toDate().getTime();
    const endMs = end._seconds ? end._seconds * 1000 : end.toDate().getTime();
    const diffMs = endMs - startMs;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  } catch (error) {
    return '-';
  }
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: 'running' | 'completed' | 'failed' | 'cancelled' }) {
  const variants: Record<typeof status, { icon: any; variant: any; label: string }> = {
    running: { icon: Clock, variant: 'secondary', label: 'Running' },
    completed: { icon: CheckCircle, variant: 'default', label: 'Completed' },
    failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
    cancelled: { icon: StopCircle, variant: 'outline', label: 'Cancelled' },
  };
  
  const config = variants[status] || variants.completed;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export function ScraperMonitoringTab() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { jobs, loading, error, refresh } = useScraperJobs(50);
  const { triggerScrapers, loading: triggering } = useTriggerScrapers();
  const { cancelJob, cancelling } = useCancelScraperJob();

  const handleTrigger = async () => {
    try {
      const result = await triggerScrapers();
      toast.success(`Scraper job started! Job ID: ${result.jobId}`);
      
      // Refresh after a short delay to show the new job
      setTimeout(() => {
        refresh();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger scrapers');
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      const success = await cancelJob(jobId);
      if (success) {
        toast.success('Job cancelled successfully');
        refresh();
      } else {
        toast.error('Failed to cancel job');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel job');
    }
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Scraper Job History</h3>
          <p className="text-sm text-muted-foreground">
            Monitor scraper jobs and view detailed breakdowns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refresh}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            onClick={handleTrigger}
            disabled={triggering}
          >
            {triggering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run All Scrapers Now
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>
            Showing last 50 scraper jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scraper jobs yet</p>
              <p className="text-sm mt-2">Click "Run All Scrapers Now" to start your first job</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Offers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow 
                      key={job.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(job.id)}
                    >
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {job.trigger_type === 'scheduled' ? 'Scheduled' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(job.started_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {calculateDuration(job.started_at, job.completed_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓ {job.vendors_succeeded}</span>
                          {job.vendors_failed > 0 && (
                            <span className="text-red-600">✗ {job.vendors_failed}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{job.total_products_scraped}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-green-600">{job.total_products_valid}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {job.total_created > 0 && (
                            <div className="text-blue-600">+{job.total_created} new</div>
                          )}
                          {job.total_updated > 0 && (
                            <div className="text-amber-600">~{job.total_updated} updated</div>
                          )}
                          {job.total_created === 0 && job.total_updated === 0 && (
                            <div className="text-muted-foreground">-</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === 'running' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(job.id);
                              }}
                              disabled={cancelling}
                            >
                              <StopCircle className="h-4 w-4 mr-1" />
                              Stop
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(job.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      {selectedJobId && (
        <ScraperJobDetailsDialog
          jobId={selectedJobId}
          open={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}

