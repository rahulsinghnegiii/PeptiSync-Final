/**
 * Upload History Table
 * 
 * Displays past upload records with status
 */

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
import { RefreshCw, FileSpreadsheet, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { VendorPriceUpload } from '@/types/vendorComparison';
import { useBulkDeleteOffers } from '@/hooks/useBulkDeleteOffers';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadHistoryTableProps {
  uploads: VendorPriceUpload[];
  loading: boolean;
  onRefresh: () => void;
}

export const UploadHistoryTable = ({ uploads, loading, onRefresh }: UploadHistoryTableProps) => {
  const { deleteOffersByCriteria, deleting } = useBulkDeleteOffers();
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (uploadId: string) => {
    setDeleteUploadId(uploadId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUploadId) return;

    const deletedCount = await deleteOffersByCriteria({ uploadBatchId: deleteUploadId });
    
    if (deletedCount > 0) {
      toast.success(`Deleted ${deletedCount} offers from this upload batch`);
      onRefresh();
    }
    
    setShowDeleteDialog(false);
    setDeleteUploadId(null);
  };

  const getStatusBadge = (status: VendorPriceUpload['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="default">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const getTierBadge = (tier: string) => {
    const tierMap = {
      research: 'Research',
      telehealth: 'Telehealth',
      brand: 'Brand',
    };
    return tierMap[tier as keyof typeof tierMap] || tier;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading upload history...</p>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No uploads yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your first CSV or Excel file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{uploads.length} upload(s) total</p>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                    {upload.file_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTierBadge(upload.tier)}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex gap-2">
                    <span className="text-green-600">{upload.success_count} valid</span>
                    {upload.error_count > 0 && (
                      <span className="text-destructive">{upload.error_count} errors</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(upload.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {upload.uploaded_at
                    ? formatDistanceToNow(upload.uploaded_at.toDate(), { addSuffix: true })
                    : 'Unknown'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(upload.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={upload.status !== 'completed' || deleting}
                    title={upload.status !== 'completed' ? 'Can only delete completed uploads' : 'Delete all offers from this upload'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload Batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all offers imported from this upload batch. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All Offers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

