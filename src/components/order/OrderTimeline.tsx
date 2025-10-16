import { motion } from "framer-motion";
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const OrderTimeline = ({ currentStatus, createdAt, updatedAt }: OrderTimelineProps) => {
  const statusOrder = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  const steps: TimelineStep[] = [
    {
      status: "pending",
      label: "Order Placed",
      icon: <Clock className="w-5 h-5" />,
      completed: currentIndex >= 0,
      active: currentStatus === "pending",
    },
    {
      status: "processing",
      label: "Processing",
      icon: <Package className="w-5 h-5" />,
      completed: currentIndex >= 1,
      active: currentStatus === "processing",
    },
    {
      status: "shipped",
      label: "Shipped",
      icon: <Truck className="w-5 h-5" />,
      completed: currentIndex >= 2,
      active: currentStatus === "shipped",
    },
    {
      status: "delivered",
      label: "Delivered",
      icon: <CheckCircle className="w-5 h-5" />,
      completed: currentIndex >= 3,
      active: currentStatus === "delivered",
    },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-destructive mb-1">Order Cancelled</h3>
          <p className="text-sm text-muted-foreground">
            This order was cancelled on {new Date(updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors mb-3",
                  step.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : step.active
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-border text-muted-foreground"
                )}
              >
                {step.icon}
              </motion.div>
              <p
                className={cn(
                  "text-sm font-medium text-center",
                  step.completed || step.active
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.active && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
