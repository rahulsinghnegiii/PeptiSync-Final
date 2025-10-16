import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users, CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useAnalyticsMetrics,
  useRevenueByPeriod,
  useTopProducts,
  useOrderStatusDistribution,
  type DateRange,
} from "@/hooks/useAnalytics";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch analytics data
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(dateRange);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueByPeriod(period, dateRange);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(10, dateRange);
  const { data: statusDistribution, isLoading: statusLoading } = useOrderStatusDistribution(dateRange);

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setDateRange({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
      setDatePickerOpen(false);
    }
  };

  const handleClearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDateRange(undefined);
    setDatePickerOpen(false);
  };

  // Format revenue data for chart
  const formattedRevenueData = revenueData?.map((item) => ({
    ...item,
    displayDate:
      period === "day"
        ? format(new Date(item.date), "MMM dd")
        : period === "week"
        ? `Week of ${format(new Date(item.date), "MMM dd")}`
        : format(new Date(item.date + "-01"), "MMM yyyy"),
  }));

  // Format status distribution for pie chart
  const pieChartData = statusDistribution?.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: item.percentage,
  }));

  const isLoading = metricsLoading || revenueLoading || productsLoading || statusLoading;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Analytics Dashboard</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange
                      ? `${format(new Date(dateRange.startDate), "MMM dd, yyyy")} - ${format(
                          new Date(dateRange.endDate),
                          "MMM dd, yyyy"
                        )}`
                      : "Select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date > new Date()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApplyDateRange} disabled={!startDate || !endDate} className="flex-1">
                        Apply
                      </Button>
                      <Button onClick={handleClearDateRange} variant="outline" className="flex-1">
                        Clear
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  size="sm"
                  variant={period === "day" ? "default" : "ghost"}
                  onClick={() => setPeriod("day")}
                >
                  Day
                </Button>
                <Button
                  size="sm"
                  variant={period === "week" ? "default" : "ghost"}
                  onClick={() => setPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={period === "month" ? "default" : "ghost"}
                  onClick={() => setPeriod("month")}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">${metrics?.totalRevenue.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: ${metrics?.averageOrderValue.toFixed(2) || "0.00"} per order
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.orderCount || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Users with orders</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">${metrics?.averageOrderValue.toFixed(2) || "0.00"}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : formattedRevenueData && formattedRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="displayDate" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No revenue data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{product.totalSold}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${product.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No product sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : pieChartData && pieChartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.name.toLowerCase()] || "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusDistribution?.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[status.status] || "#6b7280" }}
                        />
                        <span className="text-sm capitalize">{status.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{status.count}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {status.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No order status data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
