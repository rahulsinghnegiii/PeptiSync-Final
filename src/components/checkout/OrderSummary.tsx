import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/hooks/useCart";

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export const OrderSummary = ({
  cartItems,
  subtotal,
  shippingCost,
  total,
}: OrderSummaryProps) => {
  return (
    <Card className="glass border-glass-border sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 pb-3 border-b border-border last:border-0"
            >
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-bold text-gradient">
                  ${(item.product_price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                `$${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>
          {subtotal < 199 && subtotal > 0 && (
            <p className="text-xs text-muted-foreground">
              Add ${(199 - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span className="text-gradient">${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
