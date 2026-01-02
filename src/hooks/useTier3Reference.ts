/**
 * Vendor Comparison V1 - Tier 3 Reference Pricing Hooks
 * 
 * React hooks for CRUD operations on tier3_reference_pricing collection
 * Admin-editable brand GLP reference pricing
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
  Tier3ReferencePricing,
  Tier3ReferencePricingFormData,
  GLPType,
  Vendor,
} from '@/types/vendorComparison';
import {
  validateTier3Pricing,
  calculateBrandTotalPrice,
} from '@/lib/vendorTierValidators';

const COLLECTION_NAME = 'tier3_reference_pricing';

// ============================================================================
// FETCH TIER 3 REFERENCE PRICING
// ============================================================================

export function useTier3ReferencePricing(glpType?: GLPType) {
  const [references, setReferences] = useState<Tier3ReferencePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const referencesRef = collection(db, COLLECTION_NAME);
      let q = query(
        referencesRef,
        orderBy('product_name', 'asc')
      );

      if (glpType) {
        q = query(
          referencesRef,
          where('glp_type', '==', glpType),
          orderBy('product_name', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      const referencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Tier3ReferencePricing[];

      setReferences(referencesData);
    } catch (err) {
      console.error('Error fetching Tier 3 references:', err);
      setError('Failed to load reference pricing');
      setReferences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, [glpType]);

  return { references, loading, error, refetch: fetchReferences };
}

// ============================================================================
// FETCH TIER 3 WITH VENDOR DATA
// ============================================================================

export function useTier3ReferencePricingWithVendor(glpType?: GLPType) {
  const [references, setReferences] = useState<(Tier3ReferencePricing & { vendor: Vendor })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferencesWithVendor = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch references
      const referencesRef = collection(db, COLLECTION_NAME);
      let q = query(referencesRef, orderBy('product_name', 'asc'));

      if (glpType) {
        q = query(
          referencesRef,
          where('glp_type', '==', glpType),
          orderBy('product_name', 'asc')
        );
      }

      const referencesSnapshot = await getDocs(q);
      const referencesData = referencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Tier3ReferencePricing[];

      // Fetch vendor data for each reference
      const vendorsRef = collection(db, 'vendors');
      const vendorsSnapshot = await getDocs(vendorsRef);
      const vendorsMap = new Map<string, Vendor>();

      vendorsSnapshot.docs.forEach(doc => {
        vendorsMap.set(doc.id, { id: doc.id, ...doc.data() } as Vendor);
      });

      // Combine references with vendor data
      const referencesWithVendor = referencesData.map(ref => ({
        ...ref,
        vendor: vendorsMap.get(ref.vendor_id) || ({
          id: ref.vendor_id,
          name: 'Unknown Manufacturer',
          type: 'brand',
          website_url: '',
          verified: false,
          verification_date: null,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          created_by: '',
        } as Vendor),
      }));

      setReferences(referencesWithVendor);
    } catch (err) {
      console.error('Error fetching Tier 3 references with vendor:', err);
      setError('Failed to load reference pricing');
      setReferences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferencesWithVendor();
  }, [glpType]);

  return { references, loading, error, refetch: fetchReferencesWithVendor };
}

// ============================================================================
// GET SINGLE TIER 3 REFERENCE
// ============================================================================

export function useTier3Reference(referenceId: string | null) {
  const [reference, setReference] = useState<Tier3ReferencePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!referenceId) {
      setReference(null);
      return;
    }

    const fetchReference = async () => {
      setLoading(true);
      setError(null);

      try {
        const referenceRef = doc(db, COLLECTION_NAME, referenceId);
        const referenceSnap = await getDoc(referenceRef);

        if (referenceSnap.exists()) {
          setReference({
            id: referenceSnap.id,
            ...referenceSnap.data(),
          } as Tier3ReferencePricing);
        } else {
          setError('Reference not found');
          setReference(null);
        }
      } catch (err) {
        console.error('Error fetching Tier 3 reference:', err);
        setError('Failed to load reference');
        setReference(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReference();
  }, [referenceId]);

  return { reference, loading, error };
}

// ============================================================================
// CREATE TIER 3 REFERENCE
// ============================================================================

export function useCreateTier3Reference() {
  const [creating, setCreating] = useState(false);

  const createReference = async (
    data: Tier3ReferencePricingFormData,
    userId: string
  ): Promise<boolean> => {
    setCreating(true);

    try {
      // Validate required top-level fields
      if (!data.vendor_id || data.vendor_id.trim() === '') {
        toast.error('Vendor/Manufacturer is required. Please select a brand from the dropdown.');
        return false;
      }

      if (!data.product_name || data.product_name.trim() === '') {
        toast.error('Product name is required (e.g., Zepbound, Ozempic)');
        return false;
      }

      if (!data.glp_type) {
        toast.error('GLP-1 Type is required (Semaglutide or Tirzepatide)');
        return false;
      }

      if (!data.pricing_source) {
        toast.error('Pricing source is required');
        return false;
      }

      // Validate brand pricing
      if (!data.brand_pricing) {
        toast.error('Brand pricing data is required');
        return false;
      }

      // Calculate total_package_price if not provided
      if (
        data.brand_pricing.price_per_dose &&
        data.brand_pricing.doses_per_package &&
        !data.brand_pricing.total_package_price
      ) {
        data.brand_pricing.total_package_price = calculateBrandTotalPrice(
          data.brand_pricing.price_per_dose,
          data.brand_pricing.doses_per_package
        );
      }

      // Detailed validation with better error messages
      const validationResult = validateTier3Pricing(data.brand_pricing);
      if (!validationResult.valid) {
        const errorMessage = validationResult.errors.join('\n• ');
        toast.error(`Validation failed:\n• ${errorMessage}`, {
          duration: 5000,
        });
        console.error('Validation errors:', validationResult.errors);
        return false;
      }

      console.log('Creating reference with data:', {
        vendor_id: data.vendor_id,
        product_name: data.product_name,
        glp_type: data.glp_type,
        pricing_source: data.pricing_source,
        brand_pricing: data.brand_pricing,
      });

      const referenceData = {
        vendor_id: data.vendor_id,
        product_name: data.product_name,
        product_url: data.product_url || null,
        glp_type: data.glp_type,
        tier: 'brand' as const,
        brand_pricing: data.brand_pricing,
        pricing_source: data.pricing_source,
        verification_status: 'verified' as const, // Admin-created, auto-verified
        verified_by: userId,
        verified_at: serverTimestamp(),
        last_price_check: serverTimestamp(),
        notes: data.notes || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: userId,
      };

      await addDoc(collection(db, COLLECTION_NAME), referenceData);
      toast.success(`✅ Reference pricing for "${data.product_name}" created successfully`);
      return true;
    } catch (error) {
      console.error('Error creating Tier 3 reference:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create reference pricing: ${errorMessage}`);
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { createReference, creating };
}

// ============================================================================
// UPDATE TIER 3 REFERENCE
// ============================================================================

export function useUpdateTier3Reference() {
  const [updating, setUpdating] = useState(false);

  const updateReference = async (
    referenceId: string,
    data: Tier3ReferencePricingFormData,
    userId: string
  ): Promise<boolean> => {
    setUpdating(true);

    try {
      // Validate brand pricing
      if (!data.brand_pricing) {
        toast.error('Brand pricing data is required');
        return false;
      }

      // Calculate total_package_price if not provided
      if (
        data.brand_pricing.price_per_dose &&
        data.brand_pricing.doses_per_package &&
        !data.brand_pricing.total_package_price
      ) {
        data.brand_pricing.total_package_price = calculateBrandTotalPrice(
          data.brand_pricing.price_per_dose,
          data.brand_pricing.doses_per_package
        );
      }

      const validationResult = validateTier3Pricing(data.brand_pricing);
      if (!validationResult.valid) {
        toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
        return false;
      }

      const referenceRef = doc(db, COLLECTION_NAME, referenceId);
      const updateData = {
        vendor_id: data.vendor_id,
        product_name: data.product_name,
        product_url: data.product_url || null,
        glp_type: data.glp_type,
        brand_pricing: data.brand_pricing,
        pricing_source: data.pricing_source,
        notes: data.notes || null,
        last_price_check: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: userId,
      };

      await updateDoc(referenceRef, updateData);
      toast.success(`Reference pricing for "${data.product_name}" updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating Tier 3 reference:', error);
      toast.error('Failed to update reference pricing');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateReference, updating };
}

// ============================================================================
// DELETE TIER 3 REFERENCE
// ============================================================================

export function useDeleteTier3Reference() {
  const [deleting, setDeleting] = useState(false);

  const deleteReference = async (referenceId: string, productName: string): Promise<boolean> => {
    setDeleting(true);

    try {
      const referenceRef = doc(db, COLLECTION_NAME, referenceId);
      await deleteDoc(referenceRef);
      toast.success(`Reference pricing for "${productName}" deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting Tier 3 reference:', error);
      toast.error('Failed to delete reference pricing');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteReference, deleting };
}

// ============================================================================
// UPDATE LAST PRICE CHECK (for admin manual refresh)
// ============================================================================

export function useUpdateTier3LastCheck() {
  const [updating, setUpdating] = useState(false);

  const updateLastCheck = async (referenceId: string): Promise<boolean> => {
    setUpdating(true);

    try {
      const referenceRef = doc(db, COLLECTION_NAME, referenceId);
      await updateDoc(referenceRef, {
        last_price_check: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      toast.success('Last checked timestamp updated');
      return true;
    } catch (error) {
      console.error('Error updating last check:', error);
      toast.error('Failed to update timestamp');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateLastCheck, updating };
}

