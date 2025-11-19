import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { PermissionGuard } from "@/components/PermissionGuard";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <PermissionGuard requiredRole="admin" redirectTo="/dashboard">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <img 
                src="/logo.png" 
                alt="PeptiSync Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="products">
              <AdminProducts />
            </TabsContent>

            <TabsContent value="orders">
              <AdminOrders />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PermissionGuard>
  );
};

export default Admin;
