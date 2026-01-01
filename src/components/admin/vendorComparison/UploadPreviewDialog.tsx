/**
 * Upload Preview Dialog
 * 
 * Shows parsed CSV data with validation results before import
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { CSVParseResult, VendorTier } from '@/types/vendorComparison';

interface UploadPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parseResult: CSVParseResult;
  tier: VendorTier;
  onImport: (autoCreateVendors: boolean) => void;
  importing: boolean;
}

export const UploadPreviewDialog = ({
  open,
  onOpenChange,
  parseResult,
  tier,
  onImport,
  importing,
}: UploadPreviewDialogProps) => {
  const [autoCreateVendors, setAutoCreateVendors] = useState(true);
  const hasValidRows = parseResult.success_count > 0;
  const hasErrors = parseResult.error_count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Preview</DialogTitle>
          <DialogDescription>
            Review parsed data before importing to database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">{parseResult.total_rows}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Will Process</p>
              <p className="text-2xl font-bold text-blue-600">{parseResult.success_count}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-destructive">{parseResult.error_count}</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Smart Import</p>
              <p className="text-sm font-medium">Updates & Creates</p>
              <p className="text-xs text-muted-foreground mt-1">Detected automatically</p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="text-sm">
                <strong>Smart Import:</strong> Existing offers will be updated, new ones will be created. 
                Price changes are tracked automatically in the history.
              </p>
            </AlertDescription>
          </Alert>

          {/* Ignored Columns Alert */}
          {parseResult.ignored_columns.length > 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <p className="font-medium">Ignored columns:</p>
                <p className="text-sm">{parseResult.ignored_columns.join(', ')}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Valid Rows Preview */}
          {hasValidRows && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Valid Rows ({parseResult.success_count})
              </h3>
              <div className="border rounded-md overflow-auto max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Peptide</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.success_rows.slice(0, 10).map((row) => (
                      <TableRow key={row.row_number}>
                        <TableCell>{row.row_number}</TableCell>
                        <TableCell className="font-medium">
                          {row.data.vendor_name || row.data.brand_name}
                        </TableCell>
                        <TableCell>{row.data.peptide_name}</TableCell>
                        <TableCell className="text-sm">
                          {tier === 'research' && `${row.data.size_mg}mg @ $${row.data.price_usd}`}
                          {tier === 'telehealth' && `$${row.data.subscription_price_monthly}/mo`}
                          {tier === 'brand' && `${row.data.dose_strength} @ $${row.data.price_per_dose}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parseResult.success_count > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing first 10 of {parseResult.success_count} valid rows
                </p>
              )}
            </div>
          )}

          {/* Error Rows */}
          {hasErrors && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                Rows with Errors ({parseResult.error_count})
              </h3>
              <div className="border rounded-md overflow-auto max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.error_rows.slice(0, 10).map((row) => (
                      <TableRow key={row.row_number}>
                        <TableCell>{row.row_number}</TableCell>
                        <TableCell className="text-sm">
                          {JSON.stringify(row.data).substring(0, 100)}...
                        </TableCell>
                        <TableCell>
                          <ul className="text-xs text-destructive space-y-1">
                            {row.validation_errors.map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parseResult.error_count > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing first 10 of {parseResult.error_count} error rows
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 mr-auto">
            <Checkbox 
              id="auto-create-vendors" 
              checked={autoCreateVendors}
              onCheckedChange={(checked) => setAutoCreateVendors(checked as boolean)}
            />
            <Label 
              htmlFor="auto-create-vendors"
              className="text-sm font-normal cursor-pointer"
            >
              Automatically create missing vendors
            </Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={() => onImport(autoCreateVendors)} disabled={!hasValidRows || importing}>
              {importing ? 'Importing...' : `Import ${parseResult.success_count} Offers`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

