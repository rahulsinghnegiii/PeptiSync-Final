import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for analytics data
export interface AnalyticsMetrics {
  totalRevenue: number;
  orderCount: number;
  activeUsers: number;
  averageOrderValue: number;
}

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  image_url: string | null;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Fetch key metrics (total revenue, order count, active users)
export const useAnalyticsMetrics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["analytics", "metrics", dateRange],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      // Build date filter
      let ordersQuery = supabase
        .from("orders")
        .select("total_amount, user_id, status");

      if (dateRange) {
        ordersQuery = ordersQuery
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      // Calculate total revenue (exclude cancelled orders)
      const totalRevenue = orders
        ?.filter((o) => o.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Count orders (exclude cancelled)
      const orderCount = orders?.filter((o) => o.status !== "cancelled").length || 0;

      // Count unique active users (users who placed orders)
      const uniqueUsers = new Set(
        orders?.filter((o) => o.status !== "cancelled").map((o) => o.user_id)
      );
      const activeUsers = uniqueUsers.size;

      // Calculate average order value
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      return {
        totalRevenue,
        orderCount,
        activeUsers,
        averageOrderValue,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Aggregate revenue by day/week/month
export const useRevenueByPeriod = (
  period: "day" | "week" | "month",
  dateRange?: DateRange
) => {
  return useQuery({
    queryKey: ["analytics", "revenue", period, dateRange],
    queryFn: async (): Promise<RevenueByPeriod[]> => {
      let ordersQuery = supabase
        .from("orders")
        .select("total_amount, created_at, status")
        .neq("status", "cancelled")
        .order("created_at", { ascending: true });

      if (dateRange) {
        ordersQuery = ordersQuery
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate);
      }

      const { data: orders, error } = await ordersQuery;

      if (error) throw error;

      // Group orders by period
      const groupedData = new Map<string, { revenue: number; count: number }>();

      orders?.forEach((order) => {
        const date = new Date(order.created_at);
        let key: string;

        if (period === "day") {
          key = date.toISOString().split("T")[0];
        } else if (period === "week") {
          // Get the Monday of the week
          const monday = new Date(date);
          monday.setDate(date.getDate() - date.getDay() + 1);
          key = monday.toISOString().split("T")[0];
        } else {
          // month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        const existing = groupedData.get(key) || { revenue: 0, count: 0 };
        groupedData.set(key, {
          revenue: existing.revenue + Number(order.total_amount),
          count: existing.count + 1,
        });
      });

      // Convert to array and format
      return Array.from(groupedData.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orderCount: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Identify top-selling products
export const useTopProducts = (limit: number = 10, dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["analytics", "top-products", limit, dateRange],
    queryFn: async (): Promise<TopProduct[]> => {
      // Use materialized view if available, otherwise fall back to regular query
      // First, get order items with date filtering - select only needed columns
      let orderItemsQuery = supabase
        .from("order_items")
        .select(`
          product_id,
          product_name,
          product_price,
          quantity,
          order:orders!inner(created_at, status)
        `);

      if (dateRange) {
        orderItemsQuery = orderItemsQuery
          .gte("order.created_at", dateRange.startDate)
          .lte("order.created_at", dateRange.endDate);
      }

      const { data: orderItems, error: itemsError } = await orderItemsQuery;

      if (itemsError) throw itemsError;

      // Filter out cancelled orders and group by product
      const productMap = new Map<
        string,
        { name: string; totalSold: number; revenue: number }
      >();

      orderItems?.forEach((item: any) => {
        // Skip cancelled orders
        if (item.order?.status === "cancelled") return;

        const productId = item.product_id;
        if (!productId) return;

        const existing = productMap.get(productId) || {
          name: item.product_name,
          totalSold: 0,
          revenue: 0,
        };

        productMap.set(productId, {
          name: item.product_name,
          totalSold: existing.totalSold + item.quantity,
          revenue: existing.revenue + item.product_price * item.quantity,
        });
      });

      // Get product details for the top products
      const topProductIds = Array.from(productMap.entries())
        .sort((a, b) => b[1].totalSold - a[1].totalSold)
        .slice(0, limit)
        .map(([id]) => id);

      if (topProductIds.length === 0) {
        return [];
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, category, image_url")
        .in("id", topProductIds);

      if (productsError) throw productsError;

      // Combine data
      return topProductIds
        .map((id) => {
          const productData = productMap.get(id)!;
          const product = products?.find((p) => p.id === id);

          return {
            id,
            name: product?.name || productData.name,
            category: product?.category || "Unknown",
            totalSold: productData.totalSold,
            revenue: productData.revenue,
            image_url: product?.image_url || null,
          };
        })
        .filter((p) => p !== null);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Calculate order status distribution
export const useOrderStatusDistribution = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["analytics", "order-status", dateRange],
    queryFn: async (): Promise<OrderStatusDistribution[]> => {
      let ordersQuery = supabase.from("orders").select("status");

      if (dateRange) {
        ordersQuery = ordersQuery
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate);
      }

      const { data: orders, error } = await ordersQuery;

      if (error) throw error;

      // Count by status
      const statusCounts = new Map<string, number>();
      orders?.forEach((order) => {
        const count = statusCounts.get(order.status) || 0;
        statusCounts.set(order.status, count + 1);
      });

      const total = orders?.length || 0;

      // Convert to array with percentages
      return Array.from(statusCounts.entries())
        .map(([status, count]) => ({
          status,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000,
  });
};
