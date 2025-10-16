import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderItem {
  product_name: string;
  quantity: number;
  product_price: number;
  product_image: string | null;
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems = ({ items }: OrderItemsProps) => {
  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg truncate">{item.product_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: ${item.product_price.toFixed(2)} each
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gradient">
                  ${(item.quantity * item.product_price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItems;
