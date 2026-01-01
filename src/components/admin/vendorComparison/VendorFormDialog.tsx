/**
 * Vendor Form Dialog
 * 
 * Dialog for creating/editing vendors
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateVendor, useUpdateVendor } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import type { Vendor, VendorFormData, VendorTier } from '@/types/vendorComparison';

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onSuccess: () => void;
}

export const VendorFormDialog = ({
  open,
  onOpenChange,
  vendor,
  onSuccess,
}: VendorFormDialogProps) => {
  const { user } = useAuth();
  const { createVendor, creating } = useCreateVendor();
  const { updateVendor, updating } = useUpdateVendor();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorFormData>({
    defaultValues: {
      name: '',
      type: 'research',
      website_url: '',
      verified: false,
    },
  });

  const selectedTier = watch('type');
  const isVerified = watch('verified');

  // Reset form when dialog opens/closes or vendor changes
  useEffect(() => {
    if (open && vendor) {
      reset({
        name: vendor.name,
        type: vendor.type,
        website_url: vendor.website_url,
        verified: vendor.verified,
        metadata: vendor.metadata,
      });
    } else if (open && !vendor) {
      reset({
        name: '',
        type: 'research',
        website_url: '',
        verified: false,
      });
    }
  }, [open, vendor, reset]);

  const onSubmit = async (data: VendorFormData) => {
    if (!user) return;

    let success;
    if (vendor) {
      // Update existing vendor
      success = await updateVendor(vendor.id, data);
    } else {
      // Create new vendor
      success = await createVendor(data, user.uid);
    }

    if (success) {
      onSuccess();
    }
  };

  const isSubmitting = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor
              ? 'Update vendor information and settings.'
              : 'Add a new vendor to the comparison system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Vendor Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Peptide Sciences"
              {...register('name', { required: 'Vendor name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Tier */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Tier <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTier}
              onValueChange={(value) => setValue('type', value as VendorTier)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">Research Peptides</SelectItem>
                <SelectItem value="telehealth">Telehealth & GLP Clinics</SelectItem>
                <SelectItem value="brand">Brand / Originator GLPs</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedTier === 'research' && 'Direct price comparison by $/mg'}
              {selectedTier === 'telehealth' && 'Subscription-first pricing'}
              {selectedTier === 'brand' && 'Medication-only pricing (no subscriptions)'}
            </p>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="website_url">
              Website URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              {...register('website_url', {
                required: 'Website URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Must be a valid URL starting with http:// or https://',
                },
              })}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">{errors.website_url.message}</p>
            )}
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="verified">Verified Vendor</Label>
              <p className="text-xs text-muted-foreground">
                Mark this vendor as verified and trusted
              </p>
            </div>
            <Switch
              id="verified"
              checked={isVerified}
              onCheckedChange={(checked) => setValue('verified', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

