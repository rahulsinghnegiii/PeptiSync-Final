/**
 * Scraper Job Details Dialog
 * 
 * Modal showing full job breakdown with vendor and item drill-down
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useScraperJobDetails } from '@/hooks/useScraperJobDetails';
import { useScraperJobItems } from '@/hooks/useScraperJobItems';
import { ScraperJobVendor } from '@/types/scraperMonitoring';

interface ScraperJobDetailsDialogProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

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
    
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Vendor row with expandable items
 */
function VendorRow({ vendor, jobId }: { vendor: ScraperJobVendor; jobId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, loading } = useScraperJobItems(
    isOpen ? jobId : null,
    isOpen ? vendor.vendor_id : null
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <TableRow>
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
          <TableCell>
            <Badge
              variant={
                vendor.status === 'success'
                  ? 'default'
                  : vendor.status === 'partial'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {vendor.status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {vendor.products_found} / <span className="text-green-600">{vendor.products_valid}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1 text-sm">
              {vendor.offers_created > 0 && (
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingUp className="h-3 w-3" />
                  {vendor.offers_created} new
                </div>
              )}
              {vendor.offers_updated > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <TrendingDown className="h-3 w-3" />
                  {vendor.offers_updated} updated
                </div>
              )}
              {vendor.offers_unchanged > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Minus className="h-3 w-3" />
                  {vendor.offers_unchanged} unchanged
                </div>
              )}
            </div>
          </TableCell>
          <TableCell>
            {vendor.errors.length > 0 && (
              <Badge variant="destructive">{vendor.errors.length} errors</Badge>
            )}
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={6} className="bg-muted/30 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No items stored (cost-controlled logging - only failures and changes are stored)
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Scraped Items ({items.length})</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Peptide Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.peptide_name}
                            </TableCell>
                            <TableCell>
                              {item.size_mg ? `${item.size_mg}mg` : (
                                <span className="text-muted-foreground">
                                  {item.raw_size_text || '-'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.price_usd ? `$${item.price_usd}` : (
                                <span className="text-muted-foreground">
                                  {item.raw_price_text || '-'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === 'success'
                                    ? 'default'
                                    : 'destructive'
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.firestore_action ? (
                                <Badge variant="outline">
                                  {item.firestore_action.action}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

export function ScraperJobDetailsDialog({
  jobId,
  open,
  onClose,
}: ScraperJobDetailsDialogProps) {
  const { job, vendors, loading, error } = useScraperJobDetails(jobId);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scraper Job Details</DialogTitle>
          <DialogDescription>
            View detailed information about this scraper job, including vendor results and scraped items.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !job ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Job not found</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vendors">
                Vendors ({vendors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Job Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Job ID</p>
                      <p className="font-mono text-sm">{job.job_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trigger Type</p>
                      <Badge variant="outline">
                        {job.trigger_type === 'scheduled' ? 'Scheduled' : 'Manual'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm">{formatTimestamp(job.started_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-sm">
                        {job.completed_at ? formatTimestamp(job.completed_at) : 'Running...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {job.vendors_succeeded}
                      </span>
                      {job.vendors_failed > 0 && (
                        <>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-xl font-bold text-red-600">
                            {job.vendors_failed}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Success / Failed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{job.total_products_scraped}</div>
                    <p className="text-xs text-green-600 mt-1">
                      {job.total_products_valid} valid
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Offers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-blue-600">+{job.total_created}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="font-medium text-amber-600">~{job.total_updated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Errors */}
              {job.error_messages.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Errors ({job.error_messages.length})</div>
                    <ul className="list-disc list-inside space-y-1">
                      {job.error_messages.map((msg, i) => (
                        <li key={i} className="text-sm">{msg}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Offers</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No vendor data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          vendors.map((vendor) => (
                            <VendorRow key={vendor.id} vendor={vendor} jobId={jobId} />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

