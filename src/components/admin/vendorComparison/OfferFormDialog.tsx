/**
 * Offer Form Dialog
 * 
 * Dialog for creating new vendor offers
 * Reuses validation from OfferEditDialog but for creation
 */

import { useState, useEffect } from 'react';
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
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { useCreateVendorOffer } from '@/hooks/useVendorOffers';
import { useAuth } from '@/contexts/AuthContext';
import type { VendorTier } from '@/types/vendorComparison';

// Form schema - tier-agnostic, validates based on selected tier
const offerFormSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor is required'),
  tier: z.enum(['research', 'telehealth', 'brand']),
  peptide_name: z.string().min(1, 'Peptide name is required'),
  status: z.enum(['active', 'inactive']).default('active'),
  
  // Research pricing
  size_mg: z.string().optional(),
  price_usd: z.string().optional(),
  shipping_usd: z.string().optional(),
  lab_test_url: z.string().url('Must be valid URL').optional().or(z.literal('')),
  
  // Telehealth pricing
  subscription_price_monthly: z.string().optional(),
  subscription_includes_medication: z.boolean().optional(),
  medication_separate_cost: z.string().optional(),
  medication_dose: z.string().optional(),
  consultation_included: z.boolean().optional(),
  // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
  glp_type: z.enum(['Semaglutide', 'Tirzepatide']).optional(),
  dose_mg_per_injection: z.string().optional(),
  injections_per_month: z.string().optional(),
  total_mg_per_month: z.string().optional(),
  
  // Brand pricing
  dose_strength: z.string().optional(),
  price_per_dose: z.string().optional(),
  doses_per_package: z.string().optional(),
  product_url: z.string().url('Must be valid URL').optional().or(z.literal('')),
  
  // Common
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const OfferFormDialog = ({ open, onOpenChange, onSave }: OfferFormDialogProps) => {
  const { user } = useAuth();
  const { vendors } = useVendors();
  const { createOffer, creating } = useCreateVendorOffer();
  const [selectedTier, setSelectedTier] = useState<VendorTier | null>(null);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      vendor_id: '',
      tier: 'research',
      peptide_name: '',
      status: 'active',
      subscription_includes_medication: false,
      consultation_included: false,
      glp_type: 'Semaglutide',
      dose_mg_per_injection: '',
      injections_per_month: '4',
      total_mg_per_month: '',
    },
  });

  // Update selected tier when form tier changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tier') {
        setSelectedTier(value.tier as VendorTier);
      }
      
      // Auto-calculate total_mg_per_month for telehealth
      if (
        value.tier === 'telehealth' &&
        (name === 'dose_mg_per_injection' || name === 'injections_per_month')
      ) {
        const dose = parseFloat(value.dose_mg_per_injection || '0');
        const injections = parseInt(value.injections_per_month || '0');
        if (dose > 0 && injections > 0) {
          const total = dose * injections;
          form.setValue('total_mg_per_month', total.toFixed(2));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: OfferFormValues) => {
    if (!user) return;

    // Build tier-specific pricing data
    let offerData: any = {
      vendor_id: data.vendor_id,
      tier: data.tier,
      peptide_name: data.peptide_name,
      status: data.status,
      discount_code: data.discount_code,
      notes: data.notes,
    };

    if (data.tier === 'research') {
      offerData.research_pricing = {
        size_mg: parseFloat(data.size_mg || '0'),
        price_usd: parseFloat(data.price_usd || '0'),
        shipping_usd: data.shipping_usd ? parseFloat(data.shipping_usd) : undefined,
        lab_test_url: data.lab_test_url || undefined,
      };
    } else if (data.tier === 'telehealth') {
      offerData.telehealth_pricing = {
        subscription_price_monthly: parseFloat(data.subscription_price_monthly || '0'),
        subscription_includes_medication: data.subscription_includes_medication || false,
        medication_separate_cost: data.medication_separate_cost
          ? parseFloat(data.medication_separate_cost)
          : undefined,
        medication_dose: data.medication_dose,
        consultation_included: data.consultation_included || false,
        glp_type: data.glp_type,
        dose_mg_per_injection: data.dose_mg_per_injection ? parseFloat(data.dose_mg_per_injection) : 0,
        injections_per_month: data.injections_per_month ? parseInt(data.injections_per_month) : 4,
        total_mg_per_month: data.total_mg_per_month ? parseFloat(data.total_mg_per_month) : 0,
        required_fields_transparent: true,
      };
    } else if (data.tier === 'brand') {
      offerData.brand_pricing = {
        dose_strength: data.dose_strength || '',
        price_per_dose: parseFloat(data.price_per_dose || '0'),
        doses_per_package: data.doses_per_package ? parseInt(data.doses_per_package) : 0,
        total_package_price: 0, // Will be calculated by backend
      };
      offerData.product_url = data.product_url || undefined;
    }

    const success = await createOffer(offerData, user.uid);
    if (success) {
      form.reset();
      onSave();
    }
  };

  // Filter vendors by selected tier
  const filteredVendors = vendors.filter((v) => !selectedTier || v.type === selectedTier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Offer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tier Selection */}
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="research">Research Peptides</SelectItem>
                      <SelectItem value="telehealth">Telehealth & GLP Clinics</SelectItem>
                      <SelectItem value="brand">Brand / Originator GLPs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor Selection */}
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Peptide Name */}
            <FormField
              control={form.control}
              name="peptide_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peptide / Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BPC-157, Semaglutide" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tier-Specific Fields */}
            {selectedTier === 'research' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size_mg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (mg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="5" {...field} />
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
                          <Input type="number" step="0.01" placeholder="45.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipping_usd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="8.00" {...field} />
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
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {selectedTier === 'telehealth' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subscription_price_monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Subscription (USD) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="297.00" {...field} />
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
                        <FormLabel>Dose Strength</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2.5mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subscription_includes_medication"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Medication Included</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultation_included"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Consultation Included</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                {!form.watch('subscription_includes_medication') && (
                  <FormField
                    control={form.control}
                    name="medication_separate_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Cost (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="150.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* REQUIRED TRANSPARENCY FIELDS */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="glp_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GLP Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select GLP type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                            <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dose_mg_per_injection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dose (mg) per Injection *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.2" {...field} />
                        </FormControl>
                        <FormDescription>e.g., 0.2, 2.5</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="injections_per_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Injections per Month *</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="4" {...field} />
                        </FormControl>
                        <FormDescription>Typically 4 for weekly</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_mg_per_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total mg per Month *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.8" 
                            {...field}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>Auto-calculated: dose × injections</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {selectedTier === 'brand' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dose_strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dose Strength *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 0.25mg, 2mg" {...field} />
                        </FormControl>
                        <FormDescription>Include "mg" (e.g., "0.25mg", "2.5mg")</FormDescription>
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
                          <Input type="number" step="1" placeholder="4" {...field} />
                        </FormControl>
                        <FormDescription>Number of doses in the package</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    <Input placeholder="Optional promo code" {...field} />
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
                    <Textarea
                      placeholder="Additional notes or details..."
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
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Offer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

