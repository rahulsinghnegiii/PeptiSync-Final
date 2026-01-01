/**
 * Vendor Comparison V1 - Vendors Hooks
 * 
 * React hooks for CRUD operations on vendors collection
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import type { 
  Vendor, 
  VendorFormData,
  VendorTier,
} from '@/types/vendorComparison';

const COLLECTION_NAME = 'vendors';

// ============================================================================
// FETCH VENDORS
// ============================================================================

export function useVendors(tier?: VendorTier, verifiedOnly?: boolean) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const vendorsRef = collection(db, COLLECTION_NAME);
      let q = query(vendorsRef, orderBy('name', 'asc'));
      
      // Apply filters
      if (tier) {
        q = query(vendorsRef, where('type', '==', tier), orderBy('name', 'asc'));
      }
      
      const snapshot = await getDocs(q);
      let vendorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Vendor[];
      
      // Client-side filter for verified (Firestore doesn't support multiple where + orderBy well)
      if (verifiedOnly) {
        vendorsData = vendorsData.filter(v => v.verified);
      }
      
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [tier, verifiedOnly]);

  return { vendors, loading, error, refetch: fetchVendors };
}

// ============================================================================
// GET SINGLE VENDOR
// ============================================================================

export function useVendor(vendorId: string | null) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setVendor(null);
      return;
    }

    const fetchVendor = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const vendorRef = doc(db, COLLECTION_NAME, vendorId);
        const vendorSnap = await getDoc(vendorRef);
        
        if (vendorSnap.exists()) {
          setVendor({
            id: vendorSnap.id,
            ...vendorSnap.data(),
          } as Vendor);
        } else {
          setError('Vendor not found');
          setVendor(null);
        }
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError('Failed to load vendor');
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId]);

  return { vendor, loading, error };
}

// ============================================================================
// CREATE VENDOR
// ============================================================================

export function useCreateVendor() {
  const [creating, setCreating] = useState(false);

  const createVendor = async (data: VendorFormData, userId: string): Promise<boolean> => {
    setCreating(true);
    
    try {
      const vendorData = {
        name: data.name,
        type: data.type,
        website_url: data.website_url,
        verified: data.verified,
        verification_date: data.verified ? serverTimestamp() : null,
        metadata: data.metadata || {},
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: userId,
      };

      await addDoc(collection(db, COLLECTION_NAME), vendorData);
      toast.success(`Vendor "${data.name}" created successfully`);
      return true;
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor');
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { createVendor, creating };
}

// ============================================================================
// UPDATE VENDOR
// ============================================================================

export function useUpdateVendor() {
  const [updating, setUpdating] = useState(false);

  const updateVendor = async (
    vendorId: string,
    data: VendorFormData
  ): Promise<boolean> => {
    setUpdating(true);
    
    try {
      const vendorRef = doc(db, COLLECTION_NAME, vendorId);
      const updateData: any = {
        name: data.name,
        type: data.type,
        website_url: data.website_url,
        verified: data.verified,
        metadata: data.metadata || {},
        updated_at: serverTimestamp(),
      };

      // Update verification_date if verified status changed
      if (data.verified) {
        updateData.verification_date = serverTimestamp();
      } else {
        updateData.verification_date = null;
      }

      await updateDoc(vendorRef, updateData);
      toast.success(`Vendor "${data.name}" updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateVendor, updating };
}

// ============================================================================
// DELETE VENDOR
// ============================================================================

export function useDeleteVendor() {
  const [deleting, setDeleting] = useState(false);

  const deleteVendor = async (vendorId: string, vendorName: string): Promise<boolean> => {
    setDeleting(true);
    
    try {
      // Note: Firestore rules should prevent deletion if vendor has linked offers
      // Consider adding a check here or handling cascade delete
      const vendorRef = doc(db, COLLECTION_NAME, vendorId);
      await deleteDoc(vendorRef);
      toast.success(`Vendor "${vendorName}" deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor. It may have linked offers.');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteVendor, deleting };
}

// ============================================================================
// TOGGLE VENDOR VERIFICATION
// ============================================================================

export function useToggleVendorVerification() {
  const [toggling, setToggling] = useState(false);

  const toggleVerification = async (
    vendorId: string,
    currentVerified: boolean,
    vendorName: string
  ): Promise<boolean> => {
    setToggling(true);
    
    try {
      const vendorRef = doc(db, COLLECTION_NAME, vendorId);
      const newVerified = !currentVerified;
      
      await updateDoc(vendorRef, {
        verified: newVerified,
        verification_date: newVerified ? serverTimestamp() : null,
        updated_at: serverTimestamp(),
      });
      
      toast.success(
        `Vendor "${vendorName}" ${newVerified ? 'verified' : 'unverified'} successfully`
      );
      return true;
    } catch (error) {
      console.error('Error toggling vendor verification:', error);
      toast.error('Failed to update verification status');
      return false;
    } finally {
      setToggling(false);
    }
  };

  return { toggleVerification, toggling };
}

// ============================================================================
// SEARCH VENDORS (for autocomplete)
// ============================================================================

export function useVendorSearch() {
  const [searching, setSearching] = useState(false);

  const searchVendors = async (searchTerm: string, tier?: VendorTier): Promise<Vendor[]> => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    setSearching(true);
    
    try {
      const vendorsRef = collection(db, COLLECTION_NAME);
      let q = query(vendorsRef, orderBy('name', 'asc'));
      
      if (tier) {
        q = query(vendorsRef, where('type', '==', tier), orderBy('name', 'asc'));
      }
      
      const snapshot = await getDocs(q);
      const vendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Vendor[];
      
      // Client-side filtering for search term (Firestore doesn't support LIKE)
      const normalizedSearch = searchTerm.toLowerCase();
      return vendors.filter(v => 
        v.name.toLowerCase().includes(normalizedSearch)
      );
    } catch (error) {
      console.error('Error searching vendors:', error);
      return [];
    } finally {
      setSearching(false);
    }
  };

  return { searchVendors, searching };
}

