/**
 * PDF Upload Hook
 * 
 * Handles PDF file uploads and manual entry processing
 * Phase 4: PDF Upload + Manual Entry
 */

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import type {
  VendorTier,
  VendorPriceUpload,
  Vendor,
} from '@/types/vendorComparison';
import { calculateResearchPricePerMg, calculateBrandTotalPrice, calculateTelehealthTotalMg, normalizeVendorName } from '@/lib/vendorTierValidators';

const COLLECTION_NAME = 'vendor_price_uploads';
const OFFERS_COLLECTION = 'vendor_offers';
const STORAGE_PATH = 'vendor_uploads';

// ============================================================================
// UPLOAD PDF FILE
// ============================================================================

export function useUploadPdf() {
  const [uploading, setUploading] = useState(false);

  const uploadPdf = async (
    file: File,
    tier: VendorTier,
    userId: string
  ): Promise<{ uploadId: string; fileUrl: string } | null> => {
    setUploading(true);

    try {
      // 1. Upload PDF to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `${STORAGE_PATH}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // 2. Create upload record (status: pending manual entry)
      const uploadData: Omit<VendorPriceUpload, 'id'> = {
        upload_type: 'pdf',
        file_url: fileUrl,
        file_name: file.name,
        status: 'pending',
        tier,
        parsed_rows: [],
        total_rows: 0,
        success_count: 0,
        error_count: 0,
        errors: [],
        uploaded_by: userId,
        uploaded_at: serverTimestamp() as any,
      };

      const uploadRef = await addDoc(collection(db, COLLECTION_NAME), uploadData);

      toast.success('PDF uploaded successfully. Please enter pricing data manually.');

      return {
        uploadId: uploadRef.id,
        fileUrl,
      };
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast.error(`PDF upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPdf, uploading };
}

// ============================================================================
// PROCESS MANUAL ENTRIES FROM PDF
// ============================================================================

export function useProcessPdfEntries() {
  const [processing, setProcessing] = useState(false);

  const processEntries = async (
    uploadId: string,
    tier: VendorTier,
    entries: any[],
    userId: string
  ): Promise<boolean> => {
    setProcessing(true);

    try {
      // 1. Fetch all vendors to build name -> ID map
      const vendorsRef = collection(db, 'vendors');
      const vendorsSnapshot = await getDocs(query(vendorsRef, where('type', '==', tier)));
      const vendorIdMap = new Map<string, string>();

      vendorsSnapshot.docs.forEach((doc) => {
        const vendor = { id: doc.id, ...doc.data() } as Vendor;
        // Normalize vendor name: trim, lowercase, collapse multiple spaces
        const normalizedName = normalizeVendorName(vendor.name);
        vendorIdMap.set(normalizedName, vendor.id);
      });

      // 2. Convert manual entries to offers
      const offers = entries.map((entry) => {
        const vendorName =
          tier === 'brand'
            ? entry.brand_name || entry.vendor_name
            : entry.vendor_name;

        // Normalize the vendor name from the form the same way
        const normalizedVendorName = normalizeVendorName(vendorName);
        const vendorId = vendorIdMap.get(normalizedVendorName);

        if (!vendorId) {
          throw new Error(
            `Vendor "${vendorName}" not found. Please create vendor first or check spelling/spacing.`
          );
        }

        const baseOffer = {
          vendor_id: vendorId,
          tier,
          peptide_name: entry.peptide_name,
          status: 'active' as const,
          verification_status: 'unverified' as const,
          verified_by: null,
          verified_at: null,
          price_source_type: 'pdf_upload' as const,
          discount_code: entry.discount_code || null,
          notes: entry.notes || null,
        };

        // Add tier-specific pricing
        if (tier === 'research') {
          const pricePerMg = calculateResearchPricePerMg(entry.price_usd, entry.size_mg);
          return {
            ...baseOffer,
            research_pricing: {
              size_mg: entry.size_mg,
              price_usd: entry.price_usd,
              price_per_mg: pricePerMg,
              shipping_usd: entry.shipping_usd || 0,
              lab_test_url: entry.lab_test_url || null,
            },
          };
        } else if (tier === 'telehealth') {
          const totalMg = calculateTelehealthTotalMg(
            entry.dose_mg_per_injection,
            entry.injections_per_month
          );
          return {
            ...baseOffer,
            telehealth_pricing: {
              subscription_price_monthly: entry.subscription_price_monthly,
              subscription_includes_medication: entry.subscription_includes_medication,
              medication_separate_cost: entry.medication_separate_cost || null,
              consultation_included: entry.consultation_included || false,
              required_fields_transparent: true,
              // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
              glp_type: entry.glp_type,
              dose_mg_per_injection: entry.dose_mg_per_injection,
              injections_per_month: entry.injections_per_month,
              total_mg_per_month: totalMg,
              // DEPRECATED: Keep for backward compatibility
              medication_dose: entry.medication_dose || null,
            },
          };
        } else {
          // brand
          const totalPrice = calculateBrandTotalPrice(
            entry.price_per_dose,
            entry.doses_per_package
          );
          return {
            ...baseOffer,
            brand_pricing: {
              dose_strength: entry.dose_strength,
              price_per_dose: entry.price_per_dose,
              doses_per_package: entry.doses_per_package,
              total_package_price: totalPrice,
            },
          };
        }
      });

      // 3. Batch create offers
      const offersRef = collection(db, OFFERS_COLLECTION);
      const batchSize = 500;

      for (let i = 0; i < offers.length; i += batchSize) {
        const batch = offers.slice(i, i + batchSize);

        await Promise.all(
          batch.map((offer) =>
            addDoc(offersRef, {
              ...offer,
              last_price_check: serverTimestamp(),
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
              submitted_by: userId,
            })
          )
        );
      }

      // 4. Update upload record status
      const uploadRef = doc(db, COLLECTION_NAME, uploadId);
      await updateDoc(uploadRef, {
        status: 'completed',
        total_rows: entries.length,
        success_count: entries.length,
        error_count: 0,
        processed_at: serverTimestamp(),
        processed_by: userId,
      });

      toast.success(`Successfully created ${offers.length} offers from PDF`);
      return true;
    } catch (error: any) {
      console.error('Error processing PDF entries:', error);
      toast.error(`Processing failed: ${error.message}`);

      // Update upload record status to failed
      try {
        const uploadRef = doc(db, COLLECTION_NAME, uploadId);
        await updateDoc(uploadRef, {
          status: 'failed',
          errors: [error.message],
          processed_at: serverTimestamp(),
          processed_by: userId,
        });
      } catch (updateError) {
        console.error('Error updating upload status:', updateError);
      }

      return false;
    } finally {
      setProcessing(false);
    }
  };

  return { processEntries, processing };
}

