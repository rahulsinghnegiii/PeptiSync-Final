import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useUserGrowth } from "@/hooks/useUserGrowth";

export const AdminAnalytics = () => {
  const { 
    data: growthData, 
    loading, 
    error,
    timeRange, 
    setTimeRange,
    recentUsersCount 
  } = useUserGrowth();

  // Get total users from the last data point (cumulative)
  const totalUsers = growthData.length > 0 
    ? growthData[growthData.length - 1].totalUsers 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Active</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              New users (last {timeRange === '30days' ? '30 days' : '12 months'})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Growth</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={timeRange === '30days' ? 'default' : 'outline'}
                onClick={() => setTimeRange('30days')}
              >
                30 Days
              </Button>
              <Button 
                size="sm" 
                variant={timeRange === '12months' ? 'default' : 'outline'}
                onClick={() => setTimeRange('12months')}
              >
                12 Months
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  angle={timeRange === '30days' ? -45 : 0}
                  textAnchor={timeRange === '30days' ? 'end' : 'middle'}
                  height={timeRange === '30days' ? 80 : 60}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  label={{ 
                    value: 'New Signups', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'currentColor' }
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  label={{ 
                    value: 'Total Users', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fill: 'currentColor' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="newUsers" 
                  fill="hsl(var(--primary))" 
                  name="New Signups"
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="totalUsers" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  name="Total Users"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No user data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Welcome to the PeptiSync admin dashboard. Here you can monitor user activity and manage the platform.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">User management available in Users tab</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
