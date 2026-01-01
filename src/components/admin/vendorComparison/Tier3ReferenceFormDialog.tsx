/**
 * Tier 3 Reference Form Dialog
 * 
 * Dialog for creating and editing Tier 3 reference pricing entries
 * Brand GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import {
  useCreateTier3Reference,
  useUpdateTier3Reference,
} from '@/hooks/useTier3Reference';
import { useAuth } from '@/contexts/AuthContext';
import type { Tier3ReferencePricing, Vendor } from '@/types/vendorComparison';

// Form schema
const tier3FormSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor/manufacturer is required'),
  product_name: z.string().min(1, 'Product name is required'),
  product_url: z.string().url('Must be valid URL').optional().or(z.literal('')),
  glp_type: z.enum(['semaglutide', 'tirzepatide']),
  dose_strength: z.string().min(1, 'Dose strength is required'),
  price_per_dose_usd: z.string().min(1, 'Price per dose is required'),
  doses_per_package: z.string().min(1, 'Doses per package is required'),
  pricing_source: z.string().min(1, 'Pricing source is required'),
  notes: z.string().optional(),
});

type Tier3FormValues = z.infer<typeof tier3FormSchema>;

interface Tier3ReferenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference?: (Tier3ReferencePricing & { vendor: Vendor }) | null;
  onSave: () => void;
}

export const Tier3ReferenceFormDialog = ({
  open,
  onOpenChange,
  reference,
  onSave,
}: Tier3ReferenceFormDialogProps) => {
  const { user } = useAuth();
  const { vendors } = useVendors();
  const { createReference, creating } = useCreateTier3Reference();
  const { updateReference, updating } = useUpdateTier3Reference();

  const isEdit = !!reference;

  const form = useForm<Tier3FormValues>({
    resolver: zodResolver(tier3FormSchema),
    defaultValues: {
      vendor_id: '',
      product_name: '',
      product_url: '',
      glp_type: 'semaglutide',
      dose_strength: '',
      price_per_dose_usd: '',
      doses_per_package: '',
      pricing_source: 'manufacturer_msrp',
      notes: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (reference) {
      form.reset({
        vendor_id: reference.vendor_id,
        product_name: reference.product_name,
        product_url: reference.product_url || '',
        glp_type: reference.glp_type,
        dose_strength: reference.brand_pricing?.dose_strength || '',
        price_per_dose_usd: reference.brand_pricing?.price_per_dose_usd.toString() || '',
        doses_per_package: reference.brand_pricing?.doses_per_package?.toString() || '',
        pricing_source: reference.pricing_source || 'manufacturer_msrp',
        notes: reference.notes || '',
      });
    }
  }, [reference, form]);

  const onSubmit = async (data: Tier3FormValues) => {
    if (!user) return;

    const referenceData: any = {
      vendor_id: data.vendor_id,
      product_name: data.product_name,
      product_url: data.product_url,
      glp_type: data.glp_type,
      pricing_source: data.pricing_source,
      notes: data.notes,
      brand_pricing: {
        price_per_dose_usd: parseFloat(data.price_per_dose_usd),
        doses_per_package: parseInt(data.doses_per_package),
        dose_strength: data.dose_strength,
        product_url: data.product_url || undefined,
      },
    };

    let success = false;
    if (isEdit && reference) {
      success = await updateReference(reference.id, referenceData, user.uid);
    } else {
      success = await createReference(referenceData, user.uid);
    }

    if (success) {
      form.reset();
      onSave();
    }
  };

  // Filter for brand vendors only
  const brandVendors = vendors.filter((v) => v.type === 'brand');

  // Debug logging
  console.log('All vendors:', vendors);
  console.log('Brand vendors:', brandVendors);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Reference Price' : 'Add Reference Price'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Vendor/Manufacturer */}
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand / Manufacturer *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brandVendors.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No brand vendors found. Please add brand vendors (Novo Nordisk, Eli Lilly) in the Vendors tab first.
                        </div>
                      ) : (
                        brandVendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Name */}
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ozempic, Wegovy, Mounjaro, Zepbound" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* GLP Type */}
            <FormField
              control={form.control}
              name="glp_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GLP-1 Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GLP type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="semaglutide">Semaglutide</SelectItem>
                      <SelectItem value="tirzepatide">Tirzepatide</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing Fields */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dose_strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dose Strength *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_per_dose_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Dose (USD) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1349.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doses_per_package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doses per Package *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product URL */}
            <FormField
              control={form.control}
              name="product_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing Source */}
            <FormField
              control={form.control}
              name="pricing_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Source *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manufacturer_msrp">Manufacturer MSRP</SelectItem>
                      <SelectItem value="pharmacy_price">Pharmacy Price</SelectItem>
                      <SelectItem value="goodrx">GoodRx</SelectItem>
                      <SelectItem value="insurance_data">Insurance Data</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about pricing, source, or updates..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update Reference' : 'Create Reference'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

