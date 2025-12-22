import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit as limitQuery
} from "firebase/firestore";
import type { VendorPriceSubmission } from "@/types/vendor";
import { toast } from "sonner";

// Helper function to convert Firebase data to VendorPriceSubmission
const convertFirebaseData = (doc: any): VendorPriceSubmission => {
  const rawData = doc.data();
  return {
    id: doc.id,
    userId: rawData.user_id?.id || rawData.submitted_by || "",
    peptideId: rawData.peptide_id?.id || null,
    peptideName: rawData.peptide_name || "",
    priceUsd: rawData.price_usd || 0,
    shippingUsd: rawData.shipping_usd || 0,
    size: rawData.size || "",
    shippingOrigin: rawData.shipping_origin || "",
    vendorName: rawData.vendor_name || "",
    vendorUrl: rawData.vendor_url || "",
    discountCode: rawData.discount_code || "",
    userNotes: rawData.user_notes || "",
    screenshotUrl: rawData.screenshot_url || "",
    labTestResultsUrl: rawData.lab_test_results_url || "",
    priceVerificationUrl: rawData.price_verification_url || "",
    submittedAt: rawData.submitted_at,
    approvalStatus: rawData.approval_status || "pending",
    approvedBy: rawData.approved_by || "",
    reviewedAt: rawData.reviewed_at,
    rejectionReason: rawData.rejection_reason || "",
    autoApproved: rawData.auto_approved || false,
    verifiedVendor: rawData.verified_vendor || false,
    displayOnPublic: rawData.display_on_public || false,
  };
};

// Hook to fetch approved vendor prices for public display
export function useApprovedVendorPrices(limit?: number) {
  const [submissions, setSubmissions] = useState<VendorPriceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const submissionsRef = collection(db, "vendor_pricing_submissions");
        
        let q = query(
          submissionsRef,
          where("approval_status", "==", "approved"),
          orderBy("price_usd", "asc")
        );

        if (limit) {
          q = query(q, limitQuery(limit));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(convertFirebaseData);

        setSubmissions(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching approved vendor prices:", err);
        setError("Failed to load vendor prices");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [limit]);

  return { submissions, loading, error };
}

// Hook to fetch all submissions (for admin)
export function useAllVendorSubmissions(status?: 'pending' | 'approved' | 'rejected') {
  const [submissions, setSubmissions] = useState<VendorPriceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const submissionsRef = collection(db, "vendor_pricing_submissions");
      
      let q = query(submissionsRef, orderBy("submitted_at", "desc"));

      if (status) {
        q = query(
          submissionsRef,
          where("approval_status", "==", status),
          orderBy("submitted_at", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(convertFirebaseData);

      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching vendor submissions:", err);
      setError("Failed to load submissions");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [status]);

  return { submissions, loading, error, refetch: fetchSubmissions };
}

// Hook to submit a new vendor price
export function useSubmitVendorPrice() {
  const [submitting, setSubmitting] = useState(false);

  const submitPrice = async (
    data: {
      peptideName: string;
      priceUsd: number;
      shippingUsd: number;
      size: string;
      shippingOrigin: string;
      vendorName?: string;
      vendorUrl?: string;
      discountCode?: string;
      userNotes?: string;
      screenshotUrl?: string;
      labTestResultsUrl?: string;
      priceVerificationUrl?: string;
    },
    userId: string
  ) => {
    setSubmitting(true);
    try {
      const submissionsRef = collection(db, "vendor_pricing_submissions");
      const userRef = doc(db, "users", userId);
      
      await addDoc(submissionsRef, {
        user_id: userRef,
        peptide_id: null,
        peptide_name: data.peptideName,
        vendor_name: data.vendorName || "",
        price_usd: data.priceUsd,
        shipping_usd: data.shippingUsd,
        size: data.size,
        shipping_origin: data.shippingOrigin,
        vendor_url: data.vendorUrl || "",
        discount_code: data.discountCode || "",
        user_notes: data.userNotes || "",
        screenshot_url: data.screenshotUrl || "",
        lab_test_results_url: data.labTestResultsUrl || "",
        price_verification_url: data.priceVerificationUrl || "",
        approval_status: "pending",
        rejection_reason: null,
        approved_by: null,
        auto_approved: false,
        verified_vendor: false,
        display_on_public: false,
        submitted_at: serverTimestamp(),
        reviewed_at: null,
      });

      toast.success("Vendor price submitted successfully! It will be reviewed by our team.");
      return true;
    } catch (error) {
      console.error("Error submitting vendor price:", error);
      toast.error("Failed to submit vendor price. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitPrice, submitting };
}

// Hook to approve a submission (admin only)
export function useApproveSubmission() {
  const [approving, setApproving] = useState(false);

  const approve = async (submissionId: string, userId: string) => {
    setApproving(true);
    try {
      const submissionRef = doc(db, "vendor_pricing_submissions", submissionId);
      const approverRef = doc(db, "users", userId);
      
      await updateDoc(submissionRef, {
        approval_status: "approved",
        approved_by: approverRef,
        reviewed_at: serverTimestamp(),
        display_on_public: true,
      });

      toast.success("Submission approved successfully!");
      return true;
    } catch (error) {
      console.error("Error approving submission:", error);
      toast.error("Failed to approve submission.");
      return false;
    } finally {
      setApproving(false);
    }
  };

  return { approve, approving };
}

// Hook to reject a submission (admin only)
export function useRejectSubmission() {
  const [rejecting, setRejecting] = useState(false);

  const reject = async (submissionId: string, reason: string, userId: string) => {
    setRejecting(true);
    try {
      const submissionRef = doc(db, "vendor_pricing_submissions", submissionId);
      const approverRef = doc(db, "users", userId);
      
      await updateDoc(submissionRef, {
        approval_status: "rejected",
        rejection_reason: reason,
        approved_by: approverRef,
        reviewed_at: serverTimestamp(),
        display_on_public: false,
      });

      toast.success("Submission rejected.");
      return true;
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast.error("Failed to reject submission.");
      return false;
    } finally {
      setRejecting(false);
    }
  };

  return { reject, rejecting };
}

// Hook to delete a submission (admin only)
export function useDeleteSubmission() {
  const [deleting, setDeleting] = useState(false);

  const deleteSubmission = async (submissionId: string) => {
    setDeleting(true);
    try {
      const submissionRef = doc(db, "vendor_pricing_submissions", submissionId);
      await deleteDoc(submissionRef);

      toast.success("Submission deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission.");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteSubmission, deleting };
}

// Hook to toggle vendor verification (admin only)
export function useToggleVendorVerification() {
  const [toggling, setToggling] = useState(false);

  const toggleVerification = async (submissionId: string, currentStatus: boolean) => {
    setToggling(true);
    try {
      const submissionRef = doc(db, "vendor_pricing_submissions", submissionId);
      await updateDoc(submissionRef, {
        verified_vendor: !currentStatus,
      });

      toast.success(`Vendor ${!currentStatus ? 'verified' : 'unverified'} successfully!`);
      return true;
    } catch (error) {
      console.error("Error toggling vendor verification:", error);
      toast.error("Failed to update vendor verification.");
      return false;
    } finally {
      setToggling(false);
    }
  };

  return { toggleVerification, toggling };
}

// Hook to update an existing submission (admin only)
export function useUpdateSubmission() {
  const [updating, setUpdating] = useState(false);

  const updateSubmission = async (
    submissionId: string, 
    data: {
      peptideName: string;
      priceUsd: number;
      shippingUsd: number;
      size: string;
      shippingOrigin: string;
      vendorName?: string;
      vendorUrl?: string;
      discountCode?: string;
      userNotes?: string;
      priceVerificationUrl?: string;
      labTestResultsUrl?: string;
    }
  ) => {
    setUpdating(true);
    try {
      const submissionRef = doc(db, "vendor_pricing_submissions", submissionId);
      await updateDoc(submissionRef, {
        peptide_name: data.peptideName,
        price_usd: data.priceUsd,
        shipping_usd: data.shippingUsd,
        size: data.size,
        shipping_origin: data.shippingOrigin,
        vendor_name: data.vendorName || "",
        vendor_url: data.vendorUrl || "",
        discount_code: data.discountCode || "",
        user_notes: data.userNotes || "",
        price_verification_url: data.priceVerificationUrl || "",
        lab_test_results_url: data.labTestResultsUrl || "",
        updated_at: serverTimestamp(),
      });

      toast.success("Submission updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission.");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateSubmission, updating };
}

// Hook to create a new submission directly (admin only)
export function useCreateAdminSubmission() {
  const [creating, setCreating] = useState(false);

  const createSubmission = async (
    data: {
      peptideName: string;
      priceUsd: number;
      shippingUsd: number;
      size: string;
      shippingOrigin: string;
      vendorName?: string;
      vendorUrl?: string;
      discountCode?: string;
      userNotes?: string;
      priceVerificationUrl?: string;
      labTestResultsUrl?: string;
      verifiedVendor?: boolean;
    },
    userId: string
  ) => {
    setCreating(true);
    try {
      const userRef = doc(db, "users", userId);
      const approverRef = doc(db, "users", userId);
      
      const submissionData = {
        user_id: userRef,
        peptide_id: null,
        peptide_name: data.peptideName,
        vendor_name: data.vendorName || "",
        price_usd: data.priceUsd,
        shipping_usd: data.shippingUsd,
        size: data.size,
        shipping_origin: data.shippingOrigin,
        vendor_url: data.vendorUrl || "",
        discount_code: data.discountCode || "",
        user_notes: data.userNotes || "",
        screenshot_url: "",
        lab_test_results_url: data.labTestResultsUrl || "",
        price_verification_url: data.priceVerificationUrl || "",
        approval_status: "approved",
        rejection_reason: null,
        approved_by: approverRef,
        reviewed_at: serverTimestamp(),
        auto_approved: true,
        verified_vendor: data.verifiedVendor || false,
        display_on_public: true,
        submitted_at: serverTimestamp(),
      };

      await addDoc(collection(db, "vendor_pricing_submissions"), submissionData);
      toast.success("Vendor price added successfully!");
      return true;
    } catch (error) {
      console.error("Error creating submission:", error);
      toast.error("Failed to add vendor price.");
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { createSubmission, creating };
}

