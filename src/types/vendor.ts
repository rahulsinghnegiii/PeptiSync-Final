import { Timestamp } from "firebase/firestore";

export interface VendorPriceSubmission {
  id: string;
  peptideId: string | null;
  peptideName: string;
  priceUsd: number;
  shippingOrigin: string;
  vendorName?: string;
  vendorUrl?: string;
  discountCode?: string;
  screenshotUrl?: string;
  submittedBy?: string;
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
  shippingOrigin: string;
  vendorName?: string;
  vendorUrl?: string;
  discountCode?: string;
  screenshot?: File;
}

export interface VendorPriceStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  verifiedVendors: number;
}

