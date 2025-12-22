import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { PeptideLibraryEntry, PeptideLibraryFormData } from "@/types/peptide";
import { PEPTIDE_CATEGORIES } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name must not exceed 100 characters."),
  category: z.string().min(1, "Please select a category."),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters.").max(200, "Short description must not exceed 200 characters."),
  description: z.string().min(50, "Description must be at least 50 characters."),
  mechanism: z.string().min(10, "Mechanism of action must be at least 10 characters."),
  commonDoses: z.string().min(5, "Common doses information is required."),
  protocol: z.string().min(10, "Protocol information is required."),
  sideEffects: z.string().min(5, "Side effects information is required."),
  warnings: z.string().min(5, "Warnings information is required."),
  interactions: z.string().min(5, "Interactions information is required."),
  injectionAreas: z.string().min(5, "Injection areas information is required."),
  isVisible: z.boolean(),
});

interface PeptideLibraryFormProps {
  initialData?: PeptideLibraryEntry | null;
  onSuccess?: () => void;
  onSubmitData: (data: PeptideLibraryFormData) => Promise<boolean>;
}

export const PeptideLibraryForm = ({ initialData, onSuccess, onSubmitData }: PeptideLibraryFormProps) => {
  const form = useForm<PeptideLibraryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      mechanism: initialData?.mechanism || "",
      commonDoses: initialData?.commonDoses || "",
      protocol: initialData?.protocol || "",
      sideEffects: initialData?.sideEffects || "",
      warnings: initialData?.warnings || "",
      interactions: initialData?.interactions || "",
      injectionAreas: initialData?.injectionAreas || "",
      isVisible: initialData?.isVisible || false,
    },
  });

  const { handleSubmit, control, watch, formState: { errors, isSubmitting } } = form;
  const shortDescriptionLength = watch("shortDescription")?.length || 0;

  const onSubmit = async (data: PeptideLibraryFormData) => {
    const success = await onSubmitData(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peptide Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Semaglutide, BPC-157" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PEPTIDE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief summary for preview" {...field} rows={2} />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground text-right">
                {shortDescriptionLength} / 200
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the peptide" {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="mechanism"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mechanism of Action</FormLabel>
              <FormControl>
                <Textarea placeholder="How the peptide works in the body" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="commonDoses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Common Doses</FormLabel>
              <FormControl>
                <Textarea placeholder="Typical dosing information" {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="protocol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Protocol</FormLabel>
              <FormControl>
                <Textarea placeholder="Recommended usage protocol and schedule" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sideEffects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Side Effects</FormLabel>
              <FormControl>
                <Textarea placeholder="Known side effects and adverse reactions" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="warnings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warnings & Precautions</FormLabel>
              <FormControl>
                <Textarea placeholder="Important warnings and precautions" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="interactions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Interactions</FormLabel>
              <FormControl>
                <Textarea placeholder="Known drug interactions" {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="injectionAreas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Injection Areas</FormLabel>
              <FormControl>
                <Textarea placeholder="Recommended injection sites" {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="isVisible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible to Users</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this entry visible in the public peptide library.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Saving Changes..." : "Creating Entry..."}
            </>
          ) : (
            initialData ? "Save Changes" : "Create Entry"
          )}
        </Button>
      </form>
    </Form>
  );
};

