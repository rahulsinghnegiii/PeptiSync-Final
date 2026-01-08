import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, QueryConstraint, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import type { VendorTier, VerificationStatus } from '@/types/vendorComparison';

export interface BulkVerifyCriteria {
  uploadBatchId?: string;
  vendorId?: string;
  verificationStatus?: VerificationStatus;
  tier?: VendorTier;
}

export function useBulkVerifyOffers() {
  const [verifying, setVerifying] = useState(false);

  const verifyOffersByCriteria = async (
    criteria: BulkVerifyCriteria,
    userId: string
  ): Promise<number> => {
    setVerifying(true);
    
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
        toast.error('No criteria specified for bulk verification');
        return 0;
      }
      
      const q = query(offersRef, ...constraints);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.info('No offers found matching criteria');
        return 0;
      }
      
      // Verify in batches
      const updatePromises = snapshot.docs.map((doc) => 
        updateDoc(doc.ref, {
          verification_status: 'verified',
          verified_by: userId,
          verified_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      );
      await Promise.all(updatePromises);
      
      const verifiedCount = snapshot.size;
      toast.success(`Verified ${verifiedCount} offer(s)`);
      return verifiedCount;
    } catch (error: any) {
      console.error('Bulk verify error:', error);
      toast.error(`Verification failed: ${error.message}`);
      return 0;
    } finally {
      setVerifying(false);
    }
  };

  return { verifyOffersByCriteria, verifying };
}

