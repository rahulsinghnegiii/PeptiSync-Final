/**
 * Tier 3 Reference Pricing Tab
 * 
 * Complete CRUD interface for managing brand GLP reference pricing
 * Admin-editable reference prices for Ozempic, Wegovy, Mounjaro, Zepbound
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import {
  useTier3ReferencePricingWithVendor,
  useDeleteTier3Reference,
} from '@/hooks/useTier3Reference';
import { Tier3ReferenceFormDialog } from './Tier3ReferenceFormDialog';
import type { Tier3ReferencePricing, Vendor } from '@/types/vendorComparison';
import { formatDistanceToNow } from 'date-fns';

export const Tier3ReferenceTab = () => {
  const [editingReference, setEditingReference] = useState<
    (Tier3ReferencePricing & { vendor: Vendor }) | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<{ id: string; name: string } | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch references with vendor data
  const { references, loading, refetch } = useTier3ReferencePricingWithVendor();
  const { deleteReference } = useDeleteTier3Reference();

  // Get GLP type badge
  const getGLPBadge = (glpType: 'semaglutide' | 'tirzepatide') => {
    const colors = {
      semaglutide: 'bg-emerald-500',
      tirzepatide: 'bg-cyan-500',
    };
    const labels = {
      semaglutide: 'Semaglutide',
      tirzepatide: 'Tirzepatide',
    };
    return (
      <Badge variant="outline" className={colors[glpType]}>
        {labels[glpType]}
      </Badge>
    );
  };

  // Format last checked
  const formatLastChecked = (timestamp: any) => {
    if (!timestamp) return 'Never';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  // Delete handlers
  const handleDeleteClick = (id: string, productName: string) => {
    setReferenceToDelete({ id, name: productName });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!referenceToDelete) return;

    const success = await deleteReference(referenceToDelete.id, referenceToDelete.name);
    if (success) {
      refetch();
    }

    setReferenceToDelete(null);
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reference pricing...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tier 3 Reference Pricing</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage reference pricing for brand GLP-1 medications (Ozempic, Wegovy, Mounjaro,
                Zepbound)
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reference Price
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Reference Pricing Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand / Vendor</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>GLP Type</TableHead>
                  <TableHead>Dose Strength</TableHead>
                  <TableHead>Price/Dose</TableHead>
                  <TableHead>Doses/Pkg</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No reference pricing entries found. Add your first reference price to get
                      started.
                    </TableCell>
                  </TableRow>
                ) : (
                  references.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.vendor.name}</TableCell>
                      <TableCell>{ref.product_name}</TableCell>
                      <TableCell>{getGLPBadge(ref.glp_type)}</TableCell>
                      <TableCell className="text-sm">
                        {ref.brand_pricing?.dose_strength || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        ${ref.brand_pricing?.price_per_dose_usd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ref.brand_pricing?.doses_per_package || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ref.brand_pricing?.total_package_price
                          ? `$${ref.brand_pricing.total_package_price.toFixed(2)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {ref.verification_status === 'verified' && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastChecked(ref.last_price_check)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReference(ref)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(ref.id, ref.product_name)}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📌 About Tier 3 Reference Pricing
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              These are <strong>reference prices</strong> for brand/originator GLP-1 medications.
              Prices shown are{' '}
              <strong>
                before insurance, patient assistance programs, or pharmacy-specific discounts
              </strong>
              . Actual out-of-pocket costs may vary significantly. This data is displayed on the
              public comparison page as informational reference only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Reference Dialog */}
      {showCreateDialog && (
        <Tier3ReferenceFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={() => {
            setShowCreateDialog(false);
            refetch();
          }}
        />
      )}

      {/* Edit Reference Dialog */}
      {editingReference && (
        <Tier3ReferenceFormDialog
          open={!!editingReference}
          onOpenChange={(open) => !open && setEditingReference(null)}
          reference={editingReference}
          onSave={() => {
            setEditingReference(null);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reference Price?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the reference pricing for "{referenceToDelete?.name}
              "? This action cannot be undone and will remove it from the public comparison page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Reference
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
