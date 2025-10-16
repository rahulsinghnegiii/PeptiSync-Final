import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import OrderTimeline from "@/components/order/OrderTimeline";
import OrderItems from "@/components/order/OrderItems";
import ShippingInfo from "@/components/order/ShippingInfo";

interface OrderWithItems {
  id: string;
  status: string;
  total_amount: number;
  tracking_number: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
    product_image: string | null;
  }>;
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderId, orders]);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price,
            product_image
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load orders");
      } else {
        setOrders(ordersData as any || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setSearchParams({ id: order.id });
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setSearchParams({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing": return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped": return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "processing": return "default";
      case "shipped": return "outline";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Individual Order Detail View
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gradient">
              Order #{selectedOrder.id.slice(0, 8)}
            </h1>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Order Status and Timeline */}
            <Card className="glass border-glass-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {getStatusIcon(selectedOrder.status)}
                      Order Status
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(selectedOrder.status)} className="capitalize">
                    {selectedOrder.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <OrderTimeline
                  currentStatus={selectedOrder.status}
                  createdAt={selectedOrder.created_at}
                  updatedAt={selectedOrder.updated_at}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <OrderItems items={selectedOrder.order_items} />

            {/* Shipping Information */}
            <ShippingInfo
              address={selectedOrder.shipping_address}
              trackingNumber={selectedOrder.tracking_number}
            />

            {/* Order Summary */}
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-gradient">
                      ${Number(selectedOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gradient">Order Tracking</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="glass border-glass-border">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <Button onClick={() => navigate("/store")}>
                Browse Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glass border-glass-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items Preview */}
                    <div className="space-y-3">
                      {order.order_items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ${item.product_price}
                            </p>
                          </div>
                          <p className="font-bold">
                            ${(item.quantity * item.product_price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{order.order_items.length - 2} more item(s)
                        </p>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-gradient">
                          ${Number(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <Button onClick={() => handleViewDetails(order)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTracking;
