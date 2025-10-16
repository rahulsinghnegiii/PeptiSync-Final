import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface OrderConfirmationProps {
  orderId: string;
  orderNumber: string;
  total: number;
  itemCount: number;
}

export const OrderConfirmation = ({
  orderId,
  orderNumber,
  total,
  itemCount,
}: OrderConfirmationProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass border-glass-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              {showConfetti && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-4xl">🎉</div>
                </motion.div>
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">
            Order Confirmed!
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Number</span>
              <span className="font-mono font-bold text-gradient">
                #{orderNumber}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-gradient">
                ${total.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Items</span>
              <span className="font-semibold">{itemCount}</span>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <div className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email with your order details
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    We'll prepare your order for shipment
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Shipping Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll get tracking information once shipped
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/orders")}
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              View Order
            </Button>
            <Button
              variant="hero"
              onClick={() => navigate("/store")}
              className="w-full"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
