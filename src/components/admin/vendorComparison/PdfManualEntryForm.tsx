/**
 * PDF Manual Entry Form
 * 
 * Form for manually entering vendor pricing data from PDF files
 * Phase 4: PDF Upload + Manual Entry
 */

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import type { VendorTier, OfferFormData } from '@/types/vendorComparison';

// Tier-specific form schemas
const researchPricingSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
  peptide_name: z.string().min(1, 'Peptide name is required'),
  size_mg: z.coerce.number().positive('Size must be positive'),
  price_usd: z.coerce.number().positive('Price must be positive'),
  shipping_usd: z.coerce.number().nonnegative('Shipping must be 0 or positive').optional(),
  lab_test_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

const telehealthPricingSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
  peptide_name: z.string().min(1, 'Peptide name is required'),
  subscription_price_monthly: z.coerce.number().positive('Subscription price must be positive'),
  subscription_includes_medication: z.boolean(),
  medication_separate_cost: z.coerce.number().nonnegative().optional(),
  medication_dose: z.string().optional(),
  consultation_included: z.boolean().optional(),
  // REQUIRED TRANSPARENCY FIELDS (LOCKED SPEC)
  glp_type: z.enum(['Semaglutide', 'Tirzepatide'], {
    required_error: 'GLP type is required',
  }),
  dose_mg_per_injection: z.coerce.number().positive('Dose per injection must be a positive number'),
  injections_per_month: z.coerce.number().int().min(1, 'Injections per month must be at least 1'),
  total_mg_per_month: z.coerce.number().positive('Total mg per month must be a positive number'),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

const brandPricingSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  peptide_name: z.string().min(1, 'Peptide name is required'),
  dose_strength: z.string().min(1, 'Dose strength is required'),
  price_per_dose: z.coerce.number().positive('Price per dose must be positive'),
  doses_per_package: z.coerce.number().positive('Doses per package must be positive'),
  product_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  discount_code: z.string().optional(),
  notes: z.string().optional(),
});

interface PdfManualEntryFormProps {
  tier: VendorTier;
  pdfFileName: string;
  pdfFileUrl: string;
  onSubmit: (entries: any[]) => Promise<void>;
  onCancel: () => void;
}

export const PdfManualEntryForm = ({
  tier,
  pdfFileName,
  pdfFileUrl,
  onSubmit,
  onCancel,
}: PdfManualEntryFormProps) => {
  const [submitting, setSubmitting] = useState(false);

  // Select schema based on tier
  const getSchema = () => {
    switch (tier) {
      case 'research':
        return z.object({ entries: z.array(researchPricingSchema) });
      case 'telehealth':
        return z.object({ entries: z.array(telehealthPricingSchema) });
      case 'brand':
        return z.object({ entries: z.array(brandPricingSchema) });
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      entries: [getDefaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  // Auto-calculate total_mg_per_month for telehealth entries
  useEffect(() => {
    if (tier !== 'telehealth') return;
    
    const subscription = form.watch((value, { name }) => {
      if (name && (name.includes('dose_mg_per_injection') || name.includes('injections_per_month'))) {
        const match = name.match(/entries\.(\d+)\./);
        if (match) {
          const index = parseInt(match[1]);
          const entries = value.entries || [];
          const entry = entries[index];
          
          if (entry) {
            const dose = parseFloat(entry.dose_mg_per_injection || 0);
            const injections = parseInt(entry.injections_per_month || 0);
            
            if (dose > 0 && injections > 0) {
              const total = dose * injections;
              form.setValue(`entries.${index}.total_mg_per_month`, total);
            }
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, tier]);

  function getDefaultEntry() {
    switch (tier) {
      case 'research':
        return {
          vendor_name: '',
          peptide_name: '',
          size_mg: 0,
          price_usd: 0,
          shipping_usd: 0,
          lab_test_url: '',
          discount_code: '',
          notes: '',
        };
      case 'telehealth':
        return {
          vendor_name: '',
          peptide_name: '',
          subscription_price_monthly: 0,
          subscription_includes_medication: false,
          medication_separate_cost: 0,
          medication_dose: '',
          consultation_included: false,
          glp_type: 'Semaglutide',
          dose_mg_per_injection: 0,
          injections_per_month: 4,
          total_mg_per_month: 0,
          discount_code: '',
          notes: '',
        };
      case 'brand':
        return {
          brand_name: '',
          peptide_name: '',
          dose_strength: '',
          price_per_dose: 0,
          doses_per_package: 0,
          product_url: '',
          discount_code: '',
          notes: '',
        };
    }
  }

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await onSubmit(data.entries);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PDF Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{pdfFileName}</p>
              <p className="text-sm text-muted-foreground">
                Tier: {tier === 'research' ? 'Research Peptides' : tier === 'telehealth' ? 'Telehealth & GLP Clinics' : 'Brand / Originator GLPs'}
              </p>
            </div>
            {pdfFileUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={pdfFileUrl} target="_blank" rel="noopener noreferrer">
                  View PDF
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Entry {index + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {tier === 'research' && (
                  <ResearchPricingFields form={form} index={index} />
                )}
                {tier === 'telehealth' && (
                  <TelehealthPricingFields form={form} index={index} />
                )}
                {tier === 'brand' && (
                  <BrandPricingFields form={form} index={index} />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => append(getDefaultEntry())}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Entry
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : `Save ${fields.length} ${fields.length === 1 ? 'Entry' : 'Entries'}`}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Research Peptide Fields
const ResearchPricingFields = ({ form, index }: { form: any; index: number }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name={`entries.${index}.vendor_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.peptide_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Peptide Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.size_mg`}
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
      name={`entries.${index}.price_usd`}
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
      name={`entries.${index}.shipping_usd`}
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
      name={`entries.${index}.lab_test_url`}
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
    <FormField
      control={form.control}
      name={`entries.${index}.discount_code`}
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
      name={`entries.${index}.notes`}
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

// Telehealth Fields
const TelehealthPricingFields = ({ form, index }: { form: any; index: number }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name={`entries.${index}.vendor_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.peptide_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Peptide Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.subscription_price_monthly`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Subscription Price (Monthly) *</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.subscription_includes_medication`}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Medication Included in Subscription</FormLabel>
          </div>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.medication_separate_cost`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Medication Separate Cost</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" {...field} />
          </FormControl>
          <FormDescription>If not included in subscription</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.medication_dose`}
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
      name={`entries.${index}.consultation_included`}
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
    
    {/* REQUIRED TRANSPARENCY FIELDS */}
    <FormField
      control={form.control}
      name={`entries.${index}.glp_type`}
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
      name={`entries.${index}.dose_mg_per_injection`}
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
      name={`entries.${index}.injections_per_month`}
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
      name={`entries.${index}.total_mg_per_month`}
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
    
    <FormField
      control={form.control}
      name={`entries.${index}.discount_code`}
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
      name={`entries.${index}.notes`}
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

// Brand GLP Fields
const BrandPricingFields = ({ form, index }: { form: any; index: number }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name={`entries.${index}.brand_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Brand Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.peptide_name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Peptide Name *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.dose_strength`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dose Strength *</FormLabel>
          <FormControl>
            <Input {...field} placeholder="e.g., 0.25mg, 2.5mg" />
          </FormControl>
          <FormDescription>Include "mg" (e.g., "0.25mg", "2.5mg")</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.price_per_dose`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Price Per Dose (USD) *</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.doses_per_package`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Doses Per Package *</FormLabel>
          <FormControl>
            <Input type="number" step="1" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.product_url`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product URL</FormLabel>
          <FormControl>
            <Input type="url" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`entries.${index}.discount_code`}
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
      name={`entries.${index}.notes`}
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

