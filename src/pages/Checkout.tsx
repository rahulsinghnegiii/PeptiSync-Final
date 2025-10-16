import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { CheckoutStepper, CheckoutStep } from "@/components/checkout/CheckoutStepper";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { ShippingFormData } from "@/lib/validations/shipping";
import { StripePaymentWrapper } from "@/components/checkout/StripePaymentWrapper";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendOrderConfirmationEmail } from "@/lib/email";

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, isLoading, subtotal, shippingCost, total, clearCart } = useCart();

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = async (intentId: string) => {
    setPaymentIntentId(intentId);
    await createOrder(intentId);
  };

  const createOrder = async (intentId: string) => {
    if (!user || !shippingData) {
      toast.error("Missing required information");
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Validate stock availability for all items
      const productIds = cartItems.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .in("id", productIds);

      if (productsError) throw productsError;

      // Check if any items are out of stock or insufficient quantity
      const stockIssues: string[] = [];
      for (const cartItem of cartItems) {
        const product = products?.find(p => p.id === cartItem.product_id);
        if (!product) {
          stockIssues.push(`${cartItem.product_name} is no longer available`);
        } else if (product.stock_quantity < cartItem.quantity) {
          stockIssues.push(
            `${product.name} only has ${product.stock_quantity} in stock (you have ${cartItem.quantity} in cart)`
          );
        }
      }

      if (stockIssues.length > 0) {
        toast.error("Stock validation failed", {
          description: stockIssues.join(". "),
        });
        setCurrentStep("shipping");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: shippingData,
          status: "processing",
          payment_intent_id: intentId,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        product_image: item.product_image,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock quantities for all products
      for (const cartItem of cartItems) {
        const { error: stockError } = await supabase.rpc(
          "decrement_product_stock",
          {
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
          }
        );

        if (stockError) {
          console.error("Error updating stock:", stockError);
          // Continue even if stock update fails - order is already created
        }
      }

      // Clear cart
      await clearCart.mutateAsync();

      // Generate order number (first 8 chars of order ID)
      const orderNum = order.id.substring(0, 8).toUpperCase();
      setOrderId(order.id);
      setOrderNumber(orderNum);
      
      // Send order confirmation email
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user.id)
          .single();

        if (profile?.email) {
          await sendOrderConfirmationEmail(profile.email, {
            orderNumber: orderNum,
            orderDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            items: cartItems.map((item) => ({
              name: item.product_name,
              quantity: item.quantity,
              price: item.product_price * item.quantity,
            })),
            subtotal,
            shipping: shippingCost,
            total,
            shippingAddress: {
              fullName: shippingData.fullName,
              address: shippingData.address,
              city: shippingData.city,
              state: shippingData.state,
              zipCode: shippingData.zipCode,
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Don't fail the order if email fails
      }
      
      setCurrentStep("confirmation");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please contact support.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass border-glass-border max-w-md text-center">
          <CardContent className="pt-6">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to your cart first!</p>
            <Button variant="hero" onClick={() => navigate("/store")}>
              Browse Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-accent"></div>
              <h1 className="text-2xl font-bold text-gradient">Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Checkout Stepper */}
      <div className="max-w-7xl mx-auto px-4">
        <CheckoutStepper currentStep={currentStep} />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === "shipping" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ShippingForm onSubmit={handleShippingSubmit} />
              </motion.div>
            )}

            {currentStep === "payment" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <StripePaymentWrapper
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep("shipping")}
                />
              </motion.div>
            )}

            {currentStep === "confirmation" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isCreatingOrder ? (
                  <Card className="glass border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">Creating your order...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : orderId && orderNumber ? (
                  <OrderConfirmation
                    orderId={orderId}
                    orderNumber={orderNumber}
                    total={total}
                    itemCount={cartItems.length}
                  />
                ) : (
                  <Card className="glass border-glass-border">
                    <CardContent className="pt-6">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                        <p className="text-destructive">Failed to create order</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
