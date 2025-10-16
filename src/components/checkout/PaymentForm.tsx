import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  amount: number;
}

export const PaymentForm = ({ onSuccess, onBack, amount }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-gradient">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stripe Payment Element */}
          <div className="min-h-[200px]">
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
