/**
 * Vendor Comparison V1 - Vendor Offers Hooks
 * 
 * React hooks for CRUD operations on vendor_offers collection
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
  VendorOffer,
  VendorOfferFormData,
  VendorOfferWithVendor,
  VendorTier,
  VerificationStatus,
  Vendor,
} from '@/types/vendorComparison';
import {
  validateTier1Pricing,
  validateTier2Pricing,
  validateTier3Pricing,
  calculateResearchPricePerMg,
  calculateBrandTotalPrice,
  calculateTelehealthTotalMg,
} from '@/lib/vendorTierValidators';

const COLLECTION_NAME = 'vendor_offers';

// ============================================================================
// FETCH VENDOR OFFERS
// ============================================================================

export function useVendorOffers(
  tier?: VendorTier,
  peptideName?: string,
  vendorId?: string,
  verificationStatus?: VerificationStatus
) {
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);

    try {
      const offersRef = collection(db, COLLECTION_NAME);
      let q = query(offersRef, orderBy('created_at', 'desc'));

      // Apply tier filter
      if (tier) {
        q = query(offersRef, where('tier', '==', tier), orderBy('created_at', 'desc'));
      }

      const snapshot = await getDocs(q);
      let offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VendorOffer[];

      // Client-side filters (Firestore doesn't support multiple where + orderBy well)
      if (peptideName) {
        offersData = offersData.filter(
          o => o.peptide_name.toLowerCase() === peptideName.toLowerCase()
        );
      }

      if (vendorId) {
        offersData = offersData.filter(o => o.vendor_id === vendorId);
      }

      if (verificationStatus) {
        offersData = offersData.filter(o => o.verification_status === verificationStatus);
      }

      setOffers(offersData);
    } catch (err) {
      console.error('Error fetching vendor offers:', err);
      setError('Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [tier, peptideName, vendorId, verificationStatus]);

  return { offers, loading, error, refetch: fetchOffers };
}

// ============================================================================
// FETCH OFFERS WITH VENDOR DATA (for display)
// ============================================================================

export function useVendorOffersWithVendor(
  tier?: VendorTier,
  peptideName?: string,
  verificationStatus?: VerificationStatus
) {
  const [offers, setOffers] = useState<VendorOfferWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffersWithVendor = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch offers
      const offersRef = collection(db, COLLECTION_NAME);
      let q = query(offersRef, orderBy('created_at', 'desc'));

      if (tier) {
        q = query(offersRef, where('tier', '==', tier), orderBy('created_at', 'desc'));
      }

      const offersSnapshot = await getDocs(q);
      let offersData = offersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VendorOffer[];

      // Client-side filters
      if (peptideName) {
        offersData = offersData.filter(
          o => o.peptide_name.toLowerCase() === peptideName.toLowerCase()
        );
      }

      if (verificationStatus) {
        offersData = offersData.filter(o => o.verification_status === verificationStatus);
      }

      // Fetch vendor data for each offer
      const vendorsRef = collection(db, 'vendors');
      const vendorsSnapshot = await getDocs(vendorsRef);
      const vendorsMap = new Map<string, Vendor>();

      vendorsSnapshot.docs.forEach(doc => {
        vendorsMap.set(doc.id, { id: doc.id, ...doc.data() } as Vendor);
      });

      // Combine offers with vendor data
      const offersWithVendor = offersData.map(offer => ({
        ...offer,
        vendor: vendorsMap.get(offer.vendor_id) || ({
          id: offer.vendor_id,
          name: 'Unknown Vendor',
          type: offer.tier,
          website_url: '',
          verified: false,
          verification_date: null,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          created_by: '',
        } as Vendor),
      }));

      setOffers(offersWithVendor);
    } catch (err) {
      console.error('Error fetching offers with vendor:', err);
      setError('Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersWithVendor();
  }, [tier, peptideName, verificationStatus]);

  return { offers, loading, error, refetch: fetchOffersWithVendor };
}

// ============================================================================
// GET SINGLE OFFER
// ============================================================================

export function useVendorOffer(offerId: string | null) {
  const [offer, setOffer] = useState<VendorOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      setOffer(null);
      return;
    }

    const fetchOffer = async () => {
      setLoading(true);
      setError(null);

      try {
        const offerRef = doc(db, COLLECTION_NAME, offerId);
        const offerSnap = await getDoc(offerRef);

        if (offerSnap.exists()) {
          setOffer({
            id: offerSnap.id,
            ...offerSnap.data(),
          } as VendorOffer);
        } else {
          setError('Offer not found');
          setOffer(null);
        }
      } catch (err) {
        console.error('Error fetching offer:', err);
        setError('Failed to load offer');
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  return { offer, loading, error };
}

// ============================================================================
// CREATE VENDOR OFFER
// ============================================================================

export function useCreateVendorOffer() {
  const [creating, setCreating] = useState(false);

  const createOffer = async (data: VendorOfferFormData, userId: string): Promise<boolean> => {
    setCreating(true);

    try {
      // Validate tier-specific pricing
      let validationResult;
      let pricingData: any = {};

      if (data.tier === 'research' && data.research_pricing) {
        // Calculate price_per_mg
        if (data.research_pricing.size_mg && data.research_pricing.price_usd) {
          data.research_pricing.price_per_mg = calculateResearchPricePerMg(
            data.research_pricing.price_usd,
            data.research_pricing.size_mg
          );
        }

        validationResult = validateTier1Pricing(data.research_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.research_pricing = data.research_pricing;
      } else if (data.tier === 'telehealth' && data.telehealth_pricing) {
        // Calculate total_mg_per_month if not provided
        if (
          data.telehealth_pricing.dose_mg_per_injection &&
          data.telehealth_pricing.injections_per_month &&
          !data.telehealth_pricing.total_mg_per_month
        ) {
          data.telehealth_pricing.total_mg_per_month = calculateTelehealthTotalMg(
            data.telehealth_pricing.dose_mg_per_injection,
            data.telehealth_pricing.injections_per_month
          );
        }

        validationResult = validateTier2Pricing(data.telehealth_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.telehealth_pricing = data.telehealth_pricing;
      } else if (data.tier === 'brand' && data.brand_pricing) {
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

        validationResult = validateTier3Pricing(data.brand_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.brand_pricing = data.brand_pricing;
      } else {
        toast.error('Pricing data is required for the selected tier');
        return false;
      }

      const offerData = {
        vendor_id: data.vendor_id,
        tier: data.tier,
        peptide_name: data.peptide_name,
        status: data.status || 'active',
        ...pricingData,
        verification_status: 'unverified' as VerificationStatus,
        verified_by: null,
        verified_at: null,
        last_price_check: serverTimestamp(),
        price_source_type: 'manual_upload',
        discount_code: data.discount_code || null,
        notes: data.notes || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        submitted_by: userId,
      };

      await addDoc(collection(db, COLLECTION_NAME), offerData);
      toast.success('Vendor offer created successfully');
      return true;
    } catch (error) {
      console.error('Error creating vendor offer:', error);
      toast.error('Failed to create offer');
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { createOffer, creating };
}

// ============================================================================
// UPDATE VENDOR OFFER
// ============================================================================

export function useUpdateVendorOffer() {
  const [updating, setUpdating] = useState(false);

  const updateOffer = async (offerId: string, data: VendorOfferFormData): Promise<boolean> => {
    setUpdating(true);

    try {
      // Validate tier-specific pricing
      let validationResult;
      let pricingData: any = {};

      if (data.tier === 'research' && data.research_pricing) {
        if (data.research_pricing.size_mg && data.research_pricing.price_usd) {
          data.research_pricing.price_per_mg = calculateResearchPricePerMg(
            data.research_pricing.price_usd,
            data.research_pricing.size_mg
          );
        }

        validationResult = validateTier1Pricing(data.research_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.research_pricing = data.research_pricing;
      } else if (data.tier === 'telehealth' && data.telehealth_pricing) {
        // Calculate total_mg_per_month if not provided
        if (
          data.telehealth_pricing.dose_mg_per_injection &&
          data.telehealth_pricing.injections_per_month &&
          !data.telehealth_pricing.total_mg_per_month
        ) {
          data.telehealth_pricing.total_mg_per_month = calculateTelehealthTotalMg(
            data.telehealth_pricing.dose_mg_per_injection,
            data.telehealth_pricing.injections_per_month
          );
        }

        validationResult = validateTier2Pricing(data.telehealth_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.telehealth_pricing = data.telehealth_pricing;
      } else if (data.tier === 'brand' && data.brand_pricing) {
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

        validationResult = validateTier3Pricing(data.brand_pricing);
        if (!validationResult.valid) {
          toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
          return false;
        }
        pricingData.brand_pricing = data.brand_pricing;
      }

      const offerRef = doc(db, COLLECTION_NAME, offerId);
      const updateData = {
        vendor_id: data.vendor_id,
        peptide_name: data.peptide_name,
        status: data.status || 'active',
        ...pricingData,
        discount_code: data.discount_code || null,
        notes: data.notes || null,
        updated_at: serverTimestamp(),
      };

      await updateDoc(offerRef, updateData);
      toast.success('Offer updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateOffer, updating };
}

// ============================================================================
// DELETE VENDOR OFFER
// ============================================================================

export function useDeleteVendorOffer() {
  const [deleting, setDeleting] = useState(false);

  const deleteOffer = async (offerId: string): Promise<boolean> => {
    setDeleting(true);

    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      await deleteDoc(offerRef);
      toast.success('Offer deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteOffer, deleting };
}

// ============================================================================
// VERIFY VENDOR OFFER
// ============================================================================

export function useVerifyVendorOffer() {
  const [verifying, setVerifying] = useState(false);

  const verifyOffer = async (offerId: string, userId: string): Promise<boolean> => {
    setVerifying(true);

    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      await updateDoc(offerRef, {
        verification_status: 'verified',
        verified_by: userId,
        verified_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      toast.success('Offer verified successfully');
      return true;
    } catch (error) {
      console.error('Error verifying offer:', error);
      toast.error('Failed to verify offer');
      return false;
    } finally {
      setVerifying(false);
    }
  };

  return { verifyOffer, verifying };
}

// ============================================================================
// REJECT/DISPUTE VENDOR OFFER
// ============================================================================

export function useRejectVendorOffer() {
  const [rejecting, setRejecting] = useState(false);

  const rejectOffer = async (offerId: string, reason?: string): Promise<boolean> => {
    setRejecting(true);

    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      await updateDoc(offerRef, {
        verification_status: 'disputed',
        notes: reason ? `Disputed: ${reason}` : 'Disputed by admin',
        updated_at: serverTimestamp(),
      });

      toast.success('Offer marked as disputed');
      return true;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
      return false;
    } finally {
      setRejecting(false);
    }
  };

  return { rejectOffer, rejecting };
}

