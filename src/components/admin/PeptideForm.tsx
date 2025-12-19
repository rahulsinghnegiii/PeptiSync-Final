import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2 } from "lucide-react";
import { Peptide, PeptideFormData } from "@/types/peptide";
import { PEPTIDE_CATEGORIES, PEPTIDE_FORMS } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name must not exceed 100 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  dosage: z.string().min(1, "Dosage is required."),
  reconstitution_instructions: z.string().min(1, "Reconstitution instructions are required."),
  storage_requirements: z.string().min(1, "Storage requirements are required."),
  form: z.string().min(1, "Please select a form."),
  potency_dosage_range: z.array(z.string()).min(1, "Please add at least one dosage option."),
  approved: z.boolean(),
});

interface PeptideFormProps {
  initialData?: Peptide | null;
  onSuccess?: () => void;
  onSubmitData: (data: PeptideFormData) => Promise<boolean>;
}

export const PeptideForm = ({ initialData, onSuccess, onSubmitData }: PeptideFormProps) => {
  const [dosageInput, setDosageInput] = useState("");

  const form = useForm<PeptideFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      dosage: initialData?.dosage || "",
      reconstitution_instructions: initialData?.reconstitution_instructions || "",
      storage_requirements: initialData?.storage_requirements || "",
      form: initialData?.form || "",
      potency_dosage_range: initialData?.potency_dosage_range || [],
      approved: initialData?.approved || false,
    },
  });

  const { handleSubmit, control, setValue, formState: { errors, isSubmitting } } = form;

  const addDosageOption = () => {
    if (dosageInput.trim()) {
      const currentDosages = form.getValues("potency_dosage_range");
      if (!currentDosages.includes(dosageInput.trim())) {
        setValue("potency_dosage_range", [...currentDosages, dosageInput.trim()], { shouldValidate: true });
        setDosageInput("");
      }
    }
  };

  const removeDosageOption = (dosageToRemove: string) => {
    setValue("potency_dosage_range", form.getValues("potency_dosage_range").filter((d) => d !== dosageToRemove), { shouldValidate: true });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDosageOption();
    }
  };

  const onSubmit = async (data: PeptideFormData) => {
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

        <div className="grid grid-cols-2 gap-4">
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
            name="form"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Form</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PEPTIDE_FORMS.map((formType) => (
                      <SelectItem key={formType} value={formType}>
                        {formType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the peptide" {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommended Dosage</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 0.25mg weekly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Potency/Dosage Range Options</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              value={dosageInput}
              onChange={(e) => setDosageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 2.5mg, 5mg, 10mg"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addDosageOption}
              disabled={!dosageInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {errors.potency_dosage_range && <p className="text-sm text-destructive mt-1">{errors.potency_dosage_range.message}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.getValues("potency_dosage_range").map((dosage) => (
              <Badge key={dosage} variant="secondary" className="gap-1">
                {dosage}
                <button
                  type="button"
                  onClick={() => removeDosageOption(dosage)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <FormField
          control={control}
          name="reconstitution_instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reconstitution Instructions</FormLabel>
              <FormControl>
                <Textarea placeholder="How to reconstitute the peptide" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storage_requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Requirements</FormLabel>
              <FormControl>
                <Textarea placeholder="Storage instructions and requirements" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="approved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Approved</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Mark this peptide as approved for use.
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
              {initialData ? "Saving Changes..." : "Creating Peptide..."}
            </>
          ) : (
            initialData ? "Save Changes" : "Create Peptide"
          )}
        </Button>
      </form>
    </Form>
  );
};

