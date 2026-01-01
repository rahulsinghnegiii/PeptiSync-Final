/**
 * Review Queue Tab
 * 
 * Interface for reviewing and verifying pending vendor price submissions
 * Phase 5: Review & Verification Queue
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { CheckCircle2, XCircle, Edit, Eye, Filter } from 'lucide-react';
import { useVendorOffers, useVerifyVendorOffer, useUpdateVendorOffer, useDeleteVendorOffer } from '@/hooks/useVendorOffers';
import { useVendors } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { VendorOffer, VendorTier, VerificationStatus } from '@/types/vendorComparison';
import { OfferDetailDialog } from './OfferDetailDialog';
import { OfferEditDialog } from './OfferEditDialog';

export const ReviewQueueTab = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<VendorTier | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('unverified');
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set());
  const [viewingOffer, setViewingOffer] = useState<VendorOffer | null>(null);
  const [editingOffer, setEditingOffer] = useState<VendorOffer | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [offerToReject, setOfferToReject] = useState<string | null>(null);

  // Fetch offers and vendors
  const { offers, loading, refetch } = useVendorOffers(
    filterTier === 'all' ? undefined : filterTier
  );
  const { vendors } = useVendors();
  
  // Import mutation hooks
  const { verifyOffer: verifyOfferMutation } = useVerifyVendorOffer();
  const { updateOffer: updateOfferMutation } = useUpdateVendorOffer();
  const { deleteOffer: deleteOfferMutation } = useDeleteVendorOffer();

  // Get vendor name by ID
  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    // Search filter
    const matchesSearch =
      offer.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVendorName(offer.vendor_id).toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || offer.verification_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOffers(new Set(filteredOffers.map((o) => o.id)));
    } else {
      setSelectedOffers(new Set());
    }
  };

  const handleSelectOffer = (offerId: string, checked: boolean) => {
    const newSelected = new Set(selectedOffers);
    if (checked) {
      newSelected.add(offerId);
    } else {
      newSelected.delete(offerId);
    }
    setSelectedOffers(newSelected);
  };

  // Verification handlers
  const handleVerifyOffer = async (offerId: string) => {
    if (!user) return;
    await verifyOfferMutation(offerId, user.uid);
    setSelectedOffers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(offerId);
      return newSet;
    });
    refetch();
  };

  const handleBulkVerify = async () => {
    if (!user || selectedOffers.size === 0) return;

    const count = selectedOffers.size;
    for (const offerId of selectedOffers) {
      await verifyOfferMutation(offerId, user.uid);
    }
    setSelectedOffers(new Set());
    refetch();
    toast.success(`Verified ${count} offer${count > 1 ? 's' : ''}`);
  };

  const handleRejectClick = (offerId: string) => {
    setOfferToReject(offerId);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!offerToReject || !user) return;

    // Get the current offer to preserve its data
    const offerToUpdate = offers.find(o => o.id === offerToReject);
    if (!offerToUpdate) return;

    // Update to VendorOfferFormData format for updateOffer
    const updateData: any = {
      vendor_id: offerToUpdate.vendor_id,
      tier: offerToUpdate.tier,
      peptide_name: offerToUpdate.peptide_name,
      status: 'inactive',
      verification_status: 'disputed',
      research_pricing: offerToUpdate.research_pricing,
      telehealth_pricing: offerToUpdate.telehealth_pricing,
      brand_pricing: offerToUpdate.brand_pricing,
      discount_code: offerToUpdate.discount_code,
      notes: offerToUpdate.notes,
    };

    await updateOfferMutation(offerToReject, updateData);

    setOfferToReject(null);
    setShowRejectDialog(false);
    setSelectedOffers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(offerToReject);
      return newSet;
    });
    refetch();
  };

  const handleBulkReject = async () => {
    if (!user || selectedOffers.size === 0) return;

    const count = selectedOffers.size;
    for (const offerId of selectedOffers) {
      const offerToUpdate = offers.find(o => o.id === offerId);
      if (!offerToUpdate) continue;

      const updateData: any = {
        vendor_id: offerToUpdate.vendor_id,
        tier: offerToUpdate.tier,
        peptide_name: offerToUpdate.peptide_name,
        status: 'inactive',
        verification_status: 'disputed',
        research_pricing: offerToUpdate.research_pricing,
        telehealth_pricing: offerToUpdate.telehealth_pricing,
        brand_pricing: offerToUpdate.brand_pricing,
        discount_code: offerToUpdate.discount_code,
        notes: offerToUpdate.notes,
      };

      await updateOfferMutation(offerId, updateData);
    }
    setSelectedOffers(new Set());
    refetch();
    toast.success(`Rejected ${count} offer${count > 1 ? 's' : ''}`);
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
        return (
          <Badge variant="secondary">
            Unverified
          </Badge>
        );
      case 'disputed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        );
    }
  };

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

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review queue...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review & Verification Queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review, verify, and manage vendor pricing submissions
          </p>
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
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedOffers.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedOffers.size} selected
              </span>
              <Button size="sm" onClick={handleBulkVerify}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify All
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject All
              </Button>
            </div>
          )}

          {/* Offers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredOffers.length > 0 &&
                        filteredOffers.every((o) => selectedOffers.has(o.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Peptide</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedOffers.has(offer.id)}
                          onCheckedChange={(checked) => handleSelectOffer(offer.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {getVendorName(offer.vendor_id)}
                      </TableCell>
                      <TableCell>{offer.peptide_name}</TableCell>
                      <TableCell>{getTierBadge(offer.tier)}</TableCell>
                      <TableCell>{getStatusBadge(offer.verification_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {offer.price_source_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingOffer(offer)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOffer(offer)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {offer.verification_status === 'unverified' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVerifyOffer(offer.id)}
                                title="Verify"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectClick(offer.id)}
                                title="Reject"
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Detail Dialog */}
      {viewingOffer && (
        <OfferDetailDialog
          open={!!viewingOffer}
          onOpenChange={(open) => !open && setViewingOffer(null)}
          offer={viewingOffer}
          vendorName={getVendorName(viewingOffer.vendor_id)}
        />
      )}

      {/* Offer Edit Dialog */}
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

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the offer as "disputed" and set its status to inactive.
              The offer will no longer appear in public comparisons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

