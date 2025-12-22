import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import type { VendorPriceSubmission } from "@/types/vendor";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Upload, X, FileText } from "lucide-react";

interface VendorPriceFormProps {
  submission?: VendorPriceSubmission | null;
  onSubmit: (data: {
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
  }) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

const SHIPPING_ORIGINS = [
  "USA",
  "China",
  "Europe",
  "UK",
  "Canada",
  "Australia",
  "Other"
];

export const VendorPriceForm = ({
  submission,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: VendorPriceFormProps) => {
  const [formData, setFormData] = useState({
    peptideName: "",
    priceUsd: "",
    shippingUsd: "",
    size: "",
    shippingOrigin: "USA",
    vendorName: "",
    vendorUrl: "",
    discountCode: "",
    userNotes: "",
    priceVerificationUrl: "",
    labTestResultsUrl: "",
    verifiedVendor: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with submission data if editing
  useEffect(() => {
    if (submission && mode === 'edit') {
      setFormData({
        peptideName: submission.peptideName || "",
        priceUsd: submission.priceUsd?.toString() || "",
        shippingUsd: submission.shippingUsd?.toString() || "",
        size: submission.size || "",
        shippingOrigin: submission.shippingOrigin || "USA",
        vendorName: submission.vendorName || "",
        vendorUrl: submission.vendorUrl || "",
        discountCode: submission.discountCode || "",
        userNotes: submission.userNotes || "",
        priceVerificationUrl: submission.priceVerificationUrl || "",
        labTestResultsUrl: submission.labTestResultsUrl || "",
        verifiedVendor: submission.verifiedVendor || false,
      });
    }
  }, [submission, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.peptideName.trim()) {
      newErrors.peptideName = "Peptide name is required";
    }

    const price = parseFloat(formData.priceUsd);
    if (!formData.priceUsd || isNaN(price) || price <= 0) {
      newErrors.priceUsd = "Valid price is required";
    }

    const shippingPrice = parseFloat(formData.shippingUsd);
    if (!formData.shippingUsd || isNaN(shippingPrice) || shippingPrice < 0) {
      newErrors.shippingUsd = "Valid shipping cost is required (0 or more)";
    }

    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    }

    if (!formData.shippingOrigin) {
      newErrors.shippingOrigin = "Shipping origin is required";
    }

    // Validate URLs if provided
    if (formData.vendorUrl && formData.vendorUrl.trim()) {
      try {
        new URL(formData.vendorUrl);
      } catch {
        newErrors.vendorUrl = "Invalid URL format";
      }
    }

    if (formData.priceVerificationUrl && formData.priceVerificationUrl.trim()) {
      try {
        new URL(formData.priceVerificationUrl);
      } catch {
        newErrors.priceVerificationUrl = "Invalid URL format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, images)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `lab-test-results/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, filename);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, labTestResultsUrl: downloadURL }));
          toast.success('Lab test results uploaded successfully!');
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, labTestResultsUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await onSubmit({
      peptideName: formData.peptideName.trim(),
      priceUsd: parseFloat(formData.priceUsd),
      shippingUsd: parseFloat(formData.shippingUsd),
      size: formData.size.trim(),
      shippingOrigin: formData.shippingOrigin,
      vendorName: formData.vendorName.trim() || undefined,
      vendorUrl: formData.vendorUrl.trim() || undefined,
      discountCode: formData.discountCode.trim() || undefined,
      userNotes: formData.userNotes.trim() || undefined,
      priceVerificationUrl: formData.priceVerificationUrl.trim() || undefined,
      labTestResultsUrl: formData.labTestResultsUrl.trim() || undefined,
      verifiedVendor: formData.verifiedVendor,
    });

    if (success) {
      // Reset form if creating
      if (mode === 'create') {
        setFormData({
          peptideName: "",
          priceUsd: "",
          shippingUsd: "",
          size: "",
          shippingOrigin: "USA",
          vendorName: "",
          vendorUrl: "",
          discountCode: "",
          userNotes: "",
          priceVerificationUrl: "",
          labTestResultsUrl: "",
          verifiedVendor: false,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="peptideName">
            Peptide Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="peptideName"
            value={formData.peptideName}
            onChange={(e) => setFormData({ ...formData, peptideName: e.target.value })}
            placeholder="e.g., BPC-157, TB-500"
            disabled={isSubmitting}
          />
          {errors.peptideName && (
            <p className="text-sm text-destructive">{errors.peptideName}</p>
          )}
        </div>

        {/* Price and Size Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">
              Size <span className="text-destructive">*</span>
            </Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="e.g., 5mg, 10mg"
              disabled={isSubmitting}
            />
            {errors.size && (
              <p className="text-sm text-destructive">{errors.size}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingOrigin">
              Shipping Origin <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.shippingOrigin}
              onValueChange={(value) => setFormData({ ...formData, shippingOrigin: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="shippingOrigin">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_ORIGINS.map((origin) => (
                  <SelectItem key={origin} value={origin}>
                    {origin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.shippingOrigin && (
              <p className="text-sm text-destructive">{errors.shippingOrigin}</p>
            )}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceUsd">
              Price (USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="priceUsd"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceUsd}
              onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.priceUsd && (
              <p className="text-sm text-destructive">{errors.priceUsd}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingUsd">
              Shipping Cost (USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="shippingUsd"
              type="number"
              step="0.01"
              min="0"
              value={formData.shippingUsd}
              onChange={(e) => setFormData({ ...formData, shippingUsd: e.target.value })}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.shippingUsd && (
              <p className="text-sm text-destructive">{errors.shippingUsd}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Info Section */}
      <div className="space-y-4 pt-2 border-t">
        <h3 className="text-sm font-semibold text-muted-foreground">Vendor Information</h3>
        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Input
            id="vendorName"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            placeholder="e.g., PeptideSciences"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorUrl">Vendor URL</Label>
          <Input
            id="vendorUrl"
            type="url"
            value={formData.vendorUrl}
            onChange={(e) => setFormData({ ...formData, vendorUrl: e.target.value })}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          {errors.vendorUrl && (
            <p className="text-sm text-destructive">{errors.vendorUrl}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountCode">Discount Code</Label>
            <Input
              id="discountCode"
              value={formData.discountCode}
              onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
              placeholder="e.g., SAVE10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceVerificationUrl">Price Verification URL</Label>
            <Input
              id="priceVerificationUrl"
              type="url"
              value={formData.priceVerificationUrl}
              onChange={(e) => setFormData({ ...formData, priceVerificationUrl: e.target.value })}
              placeholder="https://example.com/product"
              disabled={isSubmitting}
            />
            {errors.priceVerificationUrl && (
              <p className="text-sm text-destructive">{errors.priceVerificationUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="space-y-4 pt-2 border-t">
        <h3 className="text-sm font-semibold text-muted-foreground">Additional Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="userNotes">Notes</Label>
          <Textarea
            id="userNotes"
            value={formData.userNotes}
            onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
            placeholder="Additional notes about this pricing..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Lab Test Results Upload */}
        <div className="space-y-2">
          <Label htmlFor="labTestResults">Lab Test Results</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Upload lab test results (PDF or image, max 10MB)
          </p>
          
          {formData.labTestResultsUrl ? (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Lab test results uploaded</p>
                <a
                  href={formData.labTestResultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View file
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isSubmitting || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                id="labTestResults"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                disabled={isSubmitting || uploading}
                className="cursor-pointer"
              />
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mode === 'create' && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="verifiedVendor">Verified Vendor</Label>
            <p className="text-sm text-muted-foreground">
              Mark this vendor as verified
            </p>
          </div>
          <Switch
            id="verifiedVendor"
            checked={formData.verifiedVendor}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, verifiedVendor: checked })
            }
            disabled={isSubmitting}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === 'create' ? "Add Price" : "Update Price"}
        </Button>
      </div>
    </form>
  );
};

