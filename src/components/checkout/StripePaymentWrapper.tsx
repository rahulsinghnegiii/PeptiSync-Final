import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentWrapperProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

export const StripePaymentWrapper = ({
  amount,
  onSuccess,
  onBack,
}: StripePaymentWrapperProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "create-payment-intent",
          {
            body: { amount, currency: "usd" },
          }
        );

        if (error) throw error;

        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("Failed to create payment intent");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize payment";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount]);

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Initializing payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="pt-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive mb-4">
              {error || "Failed to initialize payment"}
            </p>
            <button
              onClick={onBack}
              className="text-sm text-primary hover:underline"
            >
              Go back
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#8B5CF6",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm amount={amount} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  );
};
