import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, QueryConstraint } from 'firebase/firestore';
import { toast } from 'sonner';
import type { VendorTier, VerificationStatus } from '@/types/vendorComparison';

export interface BulkDeleteCriteria {
  uploadBatchId?: string;
  vendorId?: string;
  verificationStatus?: VerificationStatus;
  tier?: VendorTier;
}

export function useBulkDeleteOffers() {
  const [deleting, setDeleting] = useState(false);

  const deleteOffersByCriteria = async (
    criteria: BulkDeleteCriteria
  ): Promise<number> => {
    setDeleting(true);
    
    try {
      const offersRef = collection(db, 'vendor_offers');
      
      // Build query based on criteria
      const constraints: QueryConstraint[] = [];
      
      if (criteria.uploadBatchId) {
        constraints.push(where('upload_batch_id', '==', criteria.uploadBatchId));
      }
      if (criteria.vendorId) {
        constraints.push(where('vendor_id', '==', criteria.vendorId));
      }
      if (criteria.verificationStatus) {
        constraints.push(where('verification_status', '==', criteria.verificationStatus));
      }
      if (criteria.tier) {
        constraints.push(where('tier', '==', criteria.tier));
      }
      
      // Execute query - must have at least one constraint
      if (constraints.length === 0) {
        toast.error('No criteria specified for bulk delete');
        return 0;
      }
      
      const q = query(offersRef, ...constraints);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.info('No offers found matching criteria');
        return 0;
      }
      
      // Delete in batches
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      const deletedCount = snapshot.size;
      toast.success(`Deleted ${deletedCount} offer(s)`);
      return deletedCount;
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error(`Delete failed: ${error.message}`);
      return 0;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteOffersByCriteria, deleting };
}

