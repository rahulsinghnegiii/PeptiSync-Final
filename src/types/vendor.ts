import { Timestamp } from "firebase/firestore";

export interface VendorPriceSubmission {
  id: string;
  userId: string;
  peptideId: string | null;
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
  submittedAt?: Timestamp;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  autoApproved: boolean;
  verifiedVendor?: boolean;
  displayOnPublic?: boolean;
}

export interface VendorPriceFormData {
  peptideName: string;
  priceUsd: number;
  shippingUsd: number;
  size: string;
  shippingOrigin: string;
  vendorName?: string;
  vendorUrl?: string;
  discountCode?: string;
  userNotes?: string;
  screenshot?: File;
  labTestResults?: File;
  priceVerificationUrl?: string;
}

export interface VendorPriceStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  verifiedVendors: number;
}

