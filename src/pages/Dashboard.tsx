import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, User, LogOut, Settings, Shield, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/lib/authorization";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  membership_tier: string;
  created_at: string;
}

interface CartItem {
  id: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUser();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      if (!user) return;

      // Fetch user profile using Supabase user_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      if (!profileData) {
        // Profile doesn't exist - create it
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            membership_tier: "free",
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error("Failed to create profile");
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
      }

      // For cart and orders, we need the profile ID
      const profileId = profileData?.id;
      if (!profileId) {
        setLoading(false);
        return;
      }

      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", profileId);

      if (cartError) {
        console.error("Error fetching cart:", cartError);
      } else {
        setCartItems(cartData || []);
      }

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      } else {
        setOrders(ordersData || []);
      }

      // Check if user is admin
      const adminStatus = await isAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="PeptiSync Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-gradient">PeptiSync Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
              <Package className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="glass border-glass-border">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {profile.full_name?.[0] || profile.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    Welcome back, {profile.full_name || "User"}!
                  </CardTitle>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {profile.membership_tier} Member
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass border-glass-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
                <p className="text-xs text-muted-foreground">Items in your cart</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass border-glass-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass border-glass-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <User className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Awaiting shipment</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Cart & Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cart Items */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass border-glass-border h-full">
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Your cart is empty</p>
                    <p className="text-xs mt-2">Visit the store to start shopping!</p>
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate("/store")}
                    >
                      Browse Store
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/30 transition-colors"
                      >
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-gradient whitespace-nowrap">
                          ${(item.product_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-gradient text-lg">
                          ${cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass border-glass-border h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Recent Orders</CardTitle>
                {orders.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/orders")}
                  >
                    View All
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No orders yet</p>
                    <p className="text-xs mt-2">Complete your first purchase!</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate("/store")}
                    >
                      Browse Store
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {orders.slice(0, 5).map((order) => {
                      const getStatusVariant = (status: string) => {
                        switch (status) {
                          case "pending": return "secondary";
                          case "processing": return "default";
                          case "shipped": return "outline";
                          case "delivered": return "default";
                          case "cancelled": return "destructive";
                          default: return "secondary";
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "pending": return "text-yellow-500";
                          case "processing": return "text-blue-500";
                          case "shipped": return "text-purple-500";
                          case "delivered": return "text-green-500";
                          case "cancelled": return "text-red-500";
                          default: return "text-gray-500";
                        }
                      };

                      return (
                        <div 
                          key={order.id} 
                          className="group p-4 border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer"
                          onClick={() => navigate(`/orders?id=${order.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium group-hover:text-primary transition-colors">
                                Order #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge 
                              variant={getStatusVariant(order.status)} 
                              className="capitalize"
                            >
                              <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(order.status)}`}>●</span>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-bold text-gradient">
                              ${Number(order.total_amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;