/**
 * Vendor Price Upload Hook
 * 
 * Handles CSV/Excel file uploads and processing
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
  CSVParseResult,
  Vendor,
} from '@/types/vendorComparison';
import { parseVendorCSV, parseVendorExcel, convertRowsToOffers } from '@/lib/csvParser';
import { normalizeVendorName } from '@/lib/vendorTierValidators';
import { useVendorOfferUpsert } from './useVendorOfferUpsert';

const COLLECTION_NAME = 'vendor_price_uploads';
const STORAGE_PATH = 'vendor_uploads';

// ============================================================================
// UPLOAD FILE
// ============================================================================

export function useUploadVendorPrices() {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);

  const uploadFile = async (
    file: File,
    tier: VendorTier,
    userId: string
  ): Promise<{ uploadId: string; parseResult: CSVParseResult } | null> => {
    setUploading(true);

    try {
      // 1. Upload file to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `${STORAGE_PATH}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // 2. Parse CSV/Excel
      setParsing(true);
      const fileType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'excel' : 'csv';
      const parseResult =
        fileType === 'excel'
          ? await parseVendorExcel(file, tier)
          : await parseVendorCSV(file, tier);
      setParsing(false);

      // 3. Create upload record
      const uploadData: Omit<VendorPriceUpload, 'id'> = {
        upload_type: fileType,
        file_url: fileUrl,
        file_name: file.name,
        status: 'pending',
        tier,
        parsed_rows: parseResult.success_rows.concat(parseResult.error_rows),
        total_rows: parseResult.total_rows,
        success_count: parseResult.success_count,
        error_count: parseResult.error_count,
        errors: parseResult.error_rows.map(
          (row) => `Row ${row.row_number}: ${row.validation_errors.join(', ')}`
        ),
        ignored_columns: parseResult.ignored_columns,
        uploaded_by: userId,
        uploaded_at: serverTimestamp() as any,
      };

      const uploadRef = await addDoc(collection(db, COLLECTION_NAME), uploadData);

      toast.success(
        `File uploaded successfully. ${parseResult.success_count} valid rows, ${parseResult.error_count} errors.`
      );

      return {
        uploadId: uploadRef.id,
        parseResult,
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  return { uploadFile, uploading, parsing };
}

// ============================================================================
// BULK IMPORT
// ============================================================================

export function useBulkImportOffers() {
  const [importing, setImporting] = useState(false);
  const { upsertOffers } = useVendorOfferUpsert();

  const importOffers = async (
    uploadId: string,
    parseResult: CSVParseResult,
    tier: VendorTier,
    userId: string,
    autoCreateVendors: boolean = false
  ): Promise<boolean> => {
    setImporting(true);

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

      // 2. If auto-create is enabled, create missing vendors
      if (autoCreateVendors) {
        const missingVendors = new Map<string, string>(); // vendor name -> website URL
        
        parseResult.success_rows.forEach((row) => {
          const vendorName =
            tier === 'brand'
              ? row.data.brand_name || row.data.vendor_name
              : row.data.vendor_name;
          const normalizedVendorName = normalizeVendorName(vendorName);
          
          if (!vendorIdMap.has(normalizedVendorName)) {
            // Extract website URL from vendor_url field first, then fallback to pricing_source_url
            const websiteUrl = row.data.vendor_url || row.data.pricing_source_url || '';
            missingVendors.set(vendorName, websiteUrl); // Use original name for creation
          }
        });

        // Create missing vendors
        for (const [vendorName, websiteUrl] of missingVendors) {
          const newVendorData = {
            name: vendorName,
            type: tier,
            website_url: websiteUrl,
            verified: false,
            verification_date: null,
            metadata: {
              auto_created: true,
              created_from: 'csv_import',
            },
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: userId,
          };

          const vendorDocRef = await addDoc(vendorsRef, newVendorData);
          const normalizedName = normalizeVendorName(vendorName);
          vendorIdMap.set(normalizedName, vendorDocRef.id);
          
          console.log(`Auto-created vendor: ${vendorName} (${vendorDocRef.id}) with URL: ${websiteUrl}`);
        }

        if (missingVendors.size > 0) {
          toast.success(`Auto-created ${missingVendors.size} missing vendor(s)`);
        }
      }

      // 2b. Update existing vendors' website URLs if provided in CSV
      const vendorUpdates = new Map<string, string>(); // vendor ID -> new website URL
      
      parseResult.success_rows.forEach((row) => {
        const vendorName =
          tier === 'brand'
            ? row.data.brand_name || row.data.vendor_name
            : row.data.vendor_name;
        const normalizedVendorName = normalizeVendorName(vendorName);
        const vendorId = vendorIdMap.get(normalizedVendorName);
        
        // If vendor_url is provided in CSV and vendor exists
        const newWebsiteUrl = row.data.vendor_url;
        if (vendorId && newWebsiteUrl && newWebsiteUrl.trim() !== '') {
          vendorUpdates.set(vendorId, newWebsiteUrl);
        }
      });

      // Apply vendor URL updates
      for (const [vendorId, websiteUrl] of vendorUpdates) {
        const vendorRef = doc(db, 'vendors', vendorId);
        await updateDoc(vendorRef, {
          website_url: websiteUrl,
          updated_at: serverTimestamp(),
        });
        console.log(`Updated vendor ${vendorId} URL to: ${websiteUrl}`);
      }

      if (vendorUpdates.size > 0) {
        toast.success(`Updated ${vendorUpdates.size} vendor URL(s)`);
      }

      // 3. Convert parsed rows to offers
      const offers = convertRowsToOffers(parseResult.success_rows, tier, vendorIdMap);

      // 4. Use upsert logic instead of batch create (with price history tracking)
      const result = await upsertOffers(offers, uploadId, userId);

      // 5. Update upload record status
      const uploadRef = doc(db, COLLECTION_NAME, uploadId);
      await updateDoc(uploadRef, {
        status: 'completed',
        processed_at: serverTimestamp(),
        processed_by: userId,
      });

      toast.success(
        `Import complete: ${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged`
      );
      return true;
    } catch (error: any) {
      console.error('Error importing offers:', error);
      toast.error(`Import failed: ${error.message}`);

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
      setImporting(false);
    }
  };

  return { importOffers, importing };
}

// ============================================================================
// FETCH UPLOAD HISTORY
// ============================================================================

export function useUploadHistory(userId?: string) {
  const [uploads, setUploads] = useState<VendorPriceUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = async () => {
    setLoading(true);
    setError(null);

    try {
      const uploadsRef = collection(db, COLLECTION_NAME);
      let q;

      if (userId) {
        q = query(uploadsRef, where('uploaded_by', '==', userId));
      } else {
        q = uploadsRef;
      }

      const snapshot = await getDocs(q);
      const uploadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VendorPriceUpload[];

      // Sort by uploaded_at descending
      uploadsData.sort((a, b) => {
        const aTime = a.uploaded_at?.toMillis?.() || 0;
        const bTime = b.uploaded_at?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setUploads(uploadsData);
    } catch (err) {
      console.error('Error fetching upload history:', err);
      setError('Failed to load upload history');
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  return { uploads, loading, error, refetch: fetchUploads };
}

// ============================================================================
// DELETE UPLOAD
// ============================================================================

export function useDeleteUpload() {
  const [deleting, setDeleting] = useState(false);

  const deleteUpload = async (uploadId: string): Promise<boolean> => {
    setDeleting(true);

    try {
      const uploadRef = doc(db, COLLECTION_NAME, uploadId);
      // Note: File in storage is not deleted (keep for audit trail)
      // Only delete the upload record
      await updateDoc(uploadRef, {
        status: 'failed',
        errors: ['Deleted by admin'],
      });

      toast.success('Upload record deleted');
      return true;
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast.error('Failed to delete upload');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteUpload, deleting };
}

