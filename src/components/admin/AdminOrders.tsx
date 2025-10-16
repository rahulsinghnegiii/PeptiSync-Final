import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Package, Filter, X } from "lucide-react";
import { sendOrderStatusUpdateEmail, sendShippingNotificationEmail } from "@/lib/email";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  notes: string | null;
  shipping_address: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    status: "",
    tracking_number: "",
    notes: ""
  });
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    searchQuery: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data as any);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(order => new Date(order.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(order => new Date(order.created_at) <= toDate);
    }

    // Search filter (order ID, customer name, email)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.profiles?.full_name?.toLowerCase().includes(query) ||
        order.profiles?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: "",
      searchQuery: ""
    });
  };

  const hasActiveFilters = () => {
    return filters.status !== "all" || filters.dateFrom || filters.dateTo || filters.searchQuery;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrder) return;

    const statusChanged = formData.status !== editingOrder.status;
    const trackingAdded = formData.tracking_number && formData.tracking_number !== editingOrder.tracking_number;

    const { error } = await supabase
      .from("orders")
      .update({
        status: formData.status,
        tracking_number: formData.tracking_number || null,
        notes: formData.notes || null
      })
      .eq("id", editingOrder.id);
    
    if (error) {
      toast.error("Failed to update order");
    } else {
      toast.success("Order updated successfully");
      
      // Send email notifications
      const customerEmail = editingOrder.profiles?.email;
      const orderNumber = editingOrder.id.substring(0, 8).toUpperCase();
      
      if (customerEmail) {
        try {
          // Send status update email if status changed
          if (statusChanged) {
            const statusMessages: Record<string, string> = {
              pending: "Your order has been received and is pending processing.",
              processing: "Your order is being processed and will be shipped soon.",
              shipped: "Your order has been shipped and is on its way to you!",
              delivered: "Your order has been delivered. We hope you enjoy your purchase!",
              cancelled: "Your order has been cancelled. If you have any questions, please contact support.",
            };

            await sendOrderStatusUpdateEmail(customerEmail, {
              orderNumber,
              status: formData.status,
              statusMessage: statusMessages[formData.status] || "Your order status has been updated.",
              trackingUrl: formData.tracking_number 
                ? `https://www.google.com/search?q=${formData.tracking_number}` 
                : undefined,
            });
          }
          
          // Send shipping notification if tracking number was added and status is shipped
          if (trackingAdded && formData.status === "shipped") {
            await sendShippingNotificationEmail(customerEmail, {
              orderNumber,
              trackingNumber: formData.tracking_number,
              carrier: "Carrier", // You can enhance this to detect carrier from tracking number
              trackingUrl: `https://www.google.com/search?q=${formData.tracking_number}`,
            });
          }
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          // Don't fail the update if email fails
        }
      }
      
      fetchOrders();
      setEditingOrder(null);
    }
  };

  const editOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      status: order.status,
      tracking_number: order.tracking_number || "",
      notes: order.notes || ""
    });
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
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Order Management</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Section */}
        {showFilters && (
          <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Order ID, customer..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {hasActiveFilters() ? "No orders match the current filters" : "No orders found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  {order.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.profiles?.full_name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.profiles?.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ${Number(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status)} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.tracking_number ? (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {order.tracking_number}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-sm">No tracking</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editOrder(order)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Order</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tracking Number</Label>
                          <Input
                            value={formData.tracking_number}
                            onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                            placeholder="Enter tracking number"
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Internal notes..."
                            rows={3}
                          />
                        </div>
                        <div className="bg-muted p-3 rounded-lg space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Customer:</span>{" "}
                            <span className="font-medium">{editingOrder?.profiles?.full_name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Shipping:</span>{" "}
                            <span>{editingOrder?.shipping_address || "N/A"}</span>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          <Package className="w-4 h-4 mr-2" />
                          Update Order
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
