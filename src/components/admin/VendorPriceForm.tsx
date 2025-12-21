import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { VendorPriceSubmission } from "@/types/vendor";

interface VendorPriceFormProps {
  submission?: VendorPriceSubmission | null;
  onSubmit: (data: {
    peptideName: string;
    priceUsd: number;
    shippingOrigin: string;
    vendorName?: string;
    vendorUrl?: string;
    discountCode?: string;
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
    shippingOrigin: "USA",
    vendorName: "",
    vendorUrl: "",
    discountCode: "",
    verifiedVendor: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with submission data if editing
  useEffect(() => {
    if (submission && mode === 'edit') {
      setFormData({
        peptideName: submission.peptideName || "",
        priceUsd: submission.priceUsd?.toString() || "",
        shippingOrigin: submission.shippingOrigin || "USA",
        vendorName: submission.vendorName || "",
        vendorUrl: submission.vendorUrl || "",
        discountCode: submission.discountCode || "",
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

    if (!formData.shippingOrigin) {
      newErrors.shippingOrigin = "Shipping origin is required";
    }

    // Validate URL if provided
    if (formData.vendorUrl && formData.vendorUrl.trim()) {
      try {
        new URL(formData.vendorUrl);
      } catch {
        newErrors.vendorUrl = "Invalid URL format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await onSubmit({
      peptideName: formData.peptideName.trim(),
      priceUsd: parseFloat(formData.priceUsd),
      shippingOrigin: formData.shippingOrigin,
      vendorName: formData.vendorName.trim() || undefined,
      vendorUrl: formData.vendorUrl.trim() || undefined,
      discountCode: formData.discountCode.trim() || undefined,
      verifiedVendor: formData.verifiedVendor,
    });

    if (success) {
      // Reset form if creating
      if (mode === 'create') {
        setFormData({
          peptideName: "",
          priceUsd: "",
          shippingOrigin: "USA",
          vendorName: "",
          vendorUrl: "",
          discountCode: "",
          verifiedVendor: false,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

