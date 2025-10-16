import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "shipping" | "payment" | "confirmation";

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: "shipping" as CheckoutStep, label: "Shipping", number: 1 },
  { id: "payment" as CheckoutStep, label: "Payment", number: 2 },
  { id: "confirmation" as CheckoutStep, label: "Confirmation", number: 3 },
];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium mt-2 transition-colors",
                    (isCurrent || isCompleted) && "text-foreground",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
