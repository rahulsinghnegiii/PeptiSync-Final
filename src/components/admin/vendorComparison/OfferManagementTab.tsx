/**
 * Offer Management Tab
 * 
 * Complete CRUD interface for managing vendor offers
 * Phase 2+: Full implementation with filters and actions
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Edit, Trash2, Plus, CheckCircle2, XCircle, History } from 'lucide-react';
import { useVendorOffersWithVendor, useDeleteVendorOffer } from '@/hooks/useVendorOffers';
import { useVendors } from '@/hooks/useVendors';
import { useBulkDeleteOffers } from '@/hooks/useBulkDeleteOffers';
import type { VendorTier, VerificationStatus, VendorOfferWithVendor } from '@/types/vendorComparison';
import { OfferEditDialog } from './OfferEditDialog';
import { OfferFormDialog } from './OfferFormDialog';
import { PriceHistoryDialog } from './PriceHistoryDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const OfferManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<VendorTier | 'all'>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');
  const [editingOffer, setEditingOffer] = useState<VendorOfferWithVendor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteCriteria, setBulkDeleteCriteria] = useState<'vendor' | 'unverified' | 'tier' | ''>('');
  const [bulkDeleteValue, setBulkDeleteValue] = useState<string>('');
  const [viewingHistoryOfferId, setViewingHistoryOfferId] = useState<string | null>(null);

  // Fetch offers with vendor data
  const { offers, loading, refetch } = useVendorOffersWithVendor(
    filterTier === 'all' ? undefined : filterTier,
    undefined,
    filterStatus === 'all' ? undefined : filterStatus
  );
  const { vendors } = useVendors();
  const { deleteOffer } = useDeleteVendorOffer();
  const { deleteOffersByCriteria, deleting: bulkDeleting } = useBulkDeleteOffers();

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    // Search filter
    const matchesSearch =
      offer.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.vendor.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Vendor filter
    const matchesVendor = filterVendor === 'all' || offer.vendor_id === filterVendor;

    return matchesSearch && matchesVendor;
  });

  // Get primary price metric based on tier
  const getPriceMetric = (offer: VendorOfferWithVendor) => {
    switch (offer.tier) {
      case 'research':
        return offer.research_pricing?.price_per_mg
          ? `$${offer.research_pricing.price_per_mg.toFixed(2)}/mg`
          : 'N/A';
      case 'telehealth':
        return offer.telehealth_pricing?.subscription_monthly_usd
          ? `$${offer.telehealth_pricing.subscription_monthly_usd.toFixed(2)}/mo`
          : 'N/A';
      case 'brand':
        return offer.brand_pricing?.price_per_dose_usd
          ? `$${offer.brand_pricing.price_per_dose_usd.toFixed(2)}/dose`
          : 'N/A';
      default:
        return 'N/A';
    }
  };

  // Get tier badge
  const getTierBadge = (tier: VendorTier) => {
    const colors = {
      research: 'bg-blue-500',
      telehealth: 'bg-purple-500',
      brand: 'bg-orange-500',
    };
    const labels = {
      research: 'Research',
      telehealth: 'Telehealth',
      brand: 'Brand',
    };
    return (
      <Badge variant="outline" className={colors[tier]}>
        {labels[tier]}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'unverified':
        return <Badge variant="secondary">Unverified</Badge>;
      case 'disputed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        );
    }
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
  const handleDeleteClick = (id: string, peptideName: string, vendorName: string) => {
    setOfferToDelete({ id, name: `${vendorName} - ${peptideName}` });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;

    const success = await deleteOffer(offerToDelete.id);
    if (success) {
      refetch();
    }

    setOfferToDelete(null);
    setShowDeleteDialog(false);
  };

  // Bulk delete handlers
  const handleBulkDeleteClick = () => {
    if (!bulkDeleteCriteria) {
      toast.error('Please select a delete criteria');
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDeleteConfirm = async () => {
    let criteria: any = {};

    if (bulkDeleteCriteria === 'vendor' && bulkDeleteValue) {
      criteria.vendorId = bulkDeleteValue;
    } else if (bulkDeleteCriteria === 'unverified') {
      criteria.verificationStatus = 'unverified';
    } else if (bulkDeleteCriteria === 'tier' && bulkDeleteValue) {
      criteria.tier = bulkDeleteValue as VendorTier;
    }

    const deletedCount = await deleteOffersByCriteria(criteria);
    
    if (deletedCount > 0) {
      refetch();
    }
    
    setShowBulkDeleteDialog(false);
    setBulkDeleteCriteria('');
    setBulkDeleteValue('');
  };

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading offers...</p>
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
              <CardTitle>Offer Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage all vendor pricing offers across all tiers
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Offer
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by vendor or peptide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterTier} onValueChange={(value: any) => setFilterTier(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="telehealth">Telehealth</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterVendor} onValueChange={setFilterVendor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors
                  .filter((v) => filterTier === 'all' || v.type === filterTier)
                  .map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Delete Toolbar */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium">Bulk Delete:</span>
              <Select value={bulkDeleteCriteria} onValueChange={(value: any) => setBulkDeleteCriteria(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">By Vendor</SelectItem>
                  <SelectItem value="unverified">Unverified Only</SelectItem>
                  <SelectItem value="tier">By Tier</SelectItem>
                </SelectContent>
              </Select>
              
              {bulkDeleteCriteria === 'vendor' && (
                <Select value={bulkDeleteValue} onValueChange={setBulkDeleteValue}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {bulkDeleteCriteria === 'tier' && (
                <Select value={bulkDeleteValue} onValueChange={setBulkDeleteValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="telehealth">Telehealth</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <Button
              variant="destructive"
              onClick={handleBulkDeleteClick}
              disabled={!bulkDeleteCriteria || (bulkDeleteCriteria !== 'unverified' && !bulkDeleteValue) || bulkDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Bulk Delete
            </Button>
          </div>

          {/* Offers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Peptide</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No offers found matching filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.vendor.name}</TableCell>
                      <TableCell>{getTierBadge(offer.tier)}</TableCell>
                      <TableCell>{offer.peptide_name}</TableCell>
                      <TableCell className="font-mono text-sm">{getPriceMetric(offer)}</TableCell>
                      <TableCell>{getStatusBadge(offer.verification_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastChecked(offer.last_price_check)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingHistoryOfferId(offer.id)}
                            title="View Price History"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOffer(offer)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(offer.id, offer.peptide_name, offer.vendor.name)
                            }
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

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredOffers.length} of {offers.length} offers
            </div>
            <div className="flex gap-4">
              <span>
                Verified: {offers.filter((o) => o.verification_status === 'verified').length}
              </span>
              <span>
                Unverified: {offers.filter((o) => o.verification_status === 'unverified').length}
              </span>
              <span>
                Disputed: {offers.filter((o) => o.verification_status === 'disputed').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Offer Dialog */}
      {showCreateDialog && (
        <OfferFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={() => {
            setShowCreateDialog(false);
            refetch();
          }}
        />
      )}

      {/* Edit Offer Dialog */}
      {editingOffer && (
        <OfferEditDialog
          open={!!editingOffer}
          onOpenChange={(open) => !open && setEditingOffer(null)}
          offer={editingOffer}
          onSave={() => {
            setEditingOffer(null);
            refetch();
          }}
        />
      )}

      {/* Price History Dialog */}
      {viewingHistoryOfferId && (
        <PriceHistoryDialog
          offerId={viewingHistoryOfferId}
          open={!!viewingHistoryOfferId}
          onClose={() => setViewingHistoryOfferId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the offer for "{offerToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Delete Offers?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkDeleteCriteria === 'unverified' && (
                <>This will permanently delete all <strong>unverified</strong> offers. This action cannot be undone.</>
              )}
              {bulkDeleteCriteria === 'vendor' && (
                <>This will permanently delete all offers from the selected vendor. This action cannot be undone.</>
              )}
              {bulkDeleteCriteria === 'tier' && (
                <>This will permanently delete all offers in the selected tier. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Matching Offers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
