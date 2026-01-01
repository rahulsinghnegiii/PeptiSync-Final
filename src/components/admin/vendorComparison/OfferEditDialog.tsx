/**
 * Offer Edit Dialog
 * 
 * Allows admins to edit vendor offer pricing details
 * Phase 5: Review & Verification Queue
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateVendorOffer } from '@/hooks/useVendorOffers';
import type { VendorOffer } from '@/types/vendorComparison';
import { calculateResearchPricePerMg, calculateBrandTotalPrice } from '@/lib/vendorTierValidators';

// Schemas for each tier
const researchSchema = z.object({
  size_mg: z.coerce.number().positive('Size must be positive'),
  price_usd: z.coerce.number().positive('Price must be positive'),
  shipping_usd: z.coerce.number().nonnegative('Shipping must be 0 or positive'),
  lab_test_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

const telehealthSchema = z.object({
  subscription_price_monthly: z.coerce.number().positive('Subscription price must be positive'),
  subscription_includes_medication: z.boolean(),
  medication_separate_cost: z.coerce.number().nonnegative().optional(),
  medication_dose: z.string().optional(),
  consultation_included: z.boolean(),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

const brandSchema = z.object({
  dose_strength: z.string().min(1, 'Dose strength is required'),
  price_per_dose: z.coerce.number().positive('Price per dose must be positive'),
  doses_per_package: z.coerce.number().positive('Doses per package must be positive'),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

interface OfferEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: VendorOffer;
  onSave: () => void;
}

export const OfferEditDialog = ({
  open,
  onOpenChange,
  offer,
  onSave,
}: OfferEditDialogProps) => {
  const { updateOffer, updating } = useUpdateVendorOffer();

  const getSchema = () => {
    switch (offer.tier) {
      case 'research':
        return researchSchema;
      case 'telehealth':
        return telehealthSchema;
      case 'brand':
        return brandSchema;
    }
  };

  const getDefaultValues = () => {
    if (offer.tier === 'research' && offer.research_pricing) {
      return {
        size_mg: offer.research_pricing.size_mg,
        price_usd: offer.research_pricing.price_usd,
        shipping_usd: offer.research_pricing.shipping_usd,
        lab_test_url: offer.research_pricing.lab_test_url || '',
        discount_code: offer.discount_code || '',
        notes: offer.notes || '',
      };
    } else if (offer.tier === 'telehealth' && offer.telehealth_pricing) {
      return {
        subscription_price_monthly: offer.telehealth_pricing.subscription_price_monthly,
        subscription_includes_medication: offer.telehealth_pricing.subscription_includes_medication,
        medication_separate_cost: offer.telehealth_pricing.medication_separate_cost || 0,
        medication_dose: offer.telehealth_pricing.medication_dose || '',
        consultation_included: offer.telehealth_pricing.consultation_included || false,
        discount_code: offer.discount_code || '',
        notes: offer.notes || '',
      };
    } else if (offer.tier === 'brand' && offer.brand_pricing) {
      return {
        dose_strength: offer.brand_pricing.dose_strength,
        price_per_dose: offer.brand_pricing.price_per_dose,
        doses_per_package: offer.brand_pricing.doses_per_package,
        discount_code: offer.discount_code || '',
        notes: offer.notes || '',
      };
    }
    return {};
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [offer]);

  const onSubmit = async (data: any) => {
    let updatedOffer: any = {
      tier: offer.tier,
      vendor_id: offer.vendor_id,
      peptide_name: offer.peptide_name,
      discount_code: data.discount_code || null,
      notes: data.notes || null,
    };

    if (offer.tier === 'research') {
      const pricePerMg = calculateResearchPricePerMg(data.price_usd, data.size_mg);
      updatedOffer.research_pricing = {
        size_mg: data.size_mg,
        price_usd: data.price_usd,
        price_per_mg: pricePerMg,
        shipping_usd: data.shipping_usd,
        lab_test_url: data.lab_test_url || null,
      };
    } else if (offer.tier === 'telehealth') {
      updatedOffer.telehealth_pricing = {
        subscription_price_monthly: data.subscription_price_monthly,
        subscription_includes_medication: data.subscription_includes_medication,
        medication_separate_cost: data.medication_separate_cost || null,
        medication_dose: data.medication_dose || null,
        consultation_included: data.consultation_included,
        required_fields_transparent: true,
      };
    } else if (offer.tier === 'brand') {
      const totalPrice = calculateBrandTotalPrice(data.price_per_dose, data.doses_per_package);
      updatedOffer.brand_pricing = {
        dose_strength: data.dose_strength,
        price_per_dose: data.price_per_dose,
        doses_per_package: data.doses_per_package,
        total_package_price: totalPrice,
      };
    }

    const success = await updateOffer(offer.id, updatedOffer);
    if (success) {
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
          <DialogDescription>
            Update pricing and details for this vendor offer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {offer.tier === 'research' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size_mg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (mg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price_usd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping_usd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lab_test_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lab Test URL</FormLabel>
                        <FormControl>
                          <Input type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {offer.tier === 'telehealth' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subscription_price_monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription (Monthly) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medication_dose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Dose</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2.5mg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subscription_includes_medication"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Medication Included</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultation_included"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Consultation Included</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medication_separate_cost"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Medication Separate Cost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {offer.tier === 'brand' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dose_strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dose Strength *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 0.25mg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price_per_dose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Dose (USD) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doses_per_package"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Doses per Package *</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <FormField
              control={form.control}
              name="discount_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating || form.formState.isSubmitting}>
                {(updating || form.formState.isSubmitting) ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

