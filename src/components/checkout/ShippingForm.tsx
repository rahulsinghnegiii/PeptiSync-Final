import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MapPin } from "lucide-react";
import { shippingSchema, ShippingFormData } from "@/lib/validations/shipping";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  onBack?: () => void;
}

export const ShippingForm = ({ onSubmit, onBack }: ShippingFormProps) => {
  const { user } = useAuth();
  const [savedAddress, setSavedAddress] = useState<ShippingFormData | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  // Load saved address from profile
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("shipping_address")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.shipping_address) {
          setSavedAddress(data.shipping_address as ShippingFormData);
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadSavedAddress();
  }, [user]);

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      setValue("fullName", savedAddress.fullName);
      setValue("address", savedAddress.address);
      setValue("city", savedAddress.city);
      setValue("state", savedAddress.state);
      setValue("zipCode", savedAddress.zipCode);
      setValue("phoneNumber", savedAddress.phoneNumber);
      toast.success("Saved address loaded");
    }
  };

  const handleFormSubmit = async (data: ShippingFormData) => {
    // Save address to profile for future use
    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ shipping_address: data })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }

    onSubmit(data);
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!loadingAddress && savedAddress && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Use saved address</p>
                <p className="text-xs text-muted-foreground">
                  {savedAddress.address}, {savedAddress.city}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseSavedAddress}
              >
                Use This
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="John Doe"
              className="mt-1.5"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Main Street, Apt 4B"
              className="mt-1.5"
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="San Francisco"
                className="mt-1.5"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="CA"
                maxLength={2}
                className="mt-1.5 uppercase"
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
              {errors.state && (
                <p className="text-sm text-destructive mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                {...register("zipCode")}
                placeholder="94102"
                className="mt-1.5"
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              {...register("phoneNumber")}
              placeholder="5551234567"
              type="tel"
              className="mt-1.5"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              10 digits, no spaces or dashes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="hero"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
