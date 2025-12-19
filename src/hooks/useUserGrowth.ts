import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";

export interface UserGrowthData {
  date: string;
  newUsers: number;      // New signups in this period
  totalUsers: number;    // Cumulative total
}

export type TimeRange = '30days' | '12months';

interface UseUserGrowthReturn {
  data: UserGrowthData[];
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  recentUsersCount: number; // Count of users in current time range
}

export const useUserGrowth = (): UseUserGrowthReturn => {
  const [data, setData] = useState<UserGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [recentUsersCount, setRecentUsersCount] = useState(0);

  useEffect(() => {
    fetchAndProcessUserGrowth();
  }, [timeRange]);

  const fetchAndProcessUserGrowth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users from Firebase
      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      
      // Extract creation dates
      const usersWithDates = usersSnapshot.docs
        .map(doc => {
          const userData = doc.data();
          // Support both created_time (Firebase app) and createdAt (website)
          const createdDate = userData.created_time?.toDate() || 
                              userData.createdAt?.toDate() || 
                              null;
          return createdDate;
        })
        .filter(date => date !== null) as Date[];

      // Calculate date range
      const now = new Date();
      const cutoffDate = new Date();
      
      if (timeRange === '30days') {
        cutoffDate.setDate(now.getDate() - 30);
      } else {
        cutoffDate.setMonth(now.getMonth() - 12);
      }

      // Filter users within time range
      const usersInRange = usersWithDates.filter(date => date >= cutoffDate);
      setRecentUsersCount(usersInRange.length);

      // Group users by period
      const usersByPeriod: Record<string, number> = {};
      
      usersWithDates.forEach(date => {
        if (date < cutoffDate) return; // Skip users outside range
        
        let dateKey: string;
        if (timeRange === '30days') {
          // Group by day: "Dec 19", "Dec 20", etc.
          dateKey = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } else {
          // Group by month: "Jan 2024", "Feb 2024", etc.
          dateKey = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
        }
        
        usersByPeriod[dateKey] = (usersByPeriod[dateKey] || 0) + 1;
      });

      // Create array of all periods in range (fill gaps with 0)
      const periods: { date: string; newUsers: number; sortKey: Date }[] = [];
      
      if (timeRange === '30days') {
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dateKey = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          periods.push({
            date: dateKey,
            newUsers: usersByPeriod[dateKey] || 0,
            sortKey: new Date(date)
          });
        }
      } else {
        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          const dateKey = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          periods.push({
            date: dateKey,
            newUsers: usersByPeriod[dateKey] || 0,
            sortKey: new Date(date)
          });
        }
      }

      // Sort by date (oldest to newest)
      periods.sort((a, b) => a.sortKey.getTime() - b.sortKey.getTime());

      // Calculate cumulative totals
      // Start with users created before the time range
      const usersBeforeRange = usersWithDates.filter(date => date < cutoffDate).length;
      let cumulativeTotal = usersBeforeRange;
      
      const processedData: UserGrowthData[] = periods.map(period => {
        cumulativeTotal += period.newUsers;
        return {
          date: period.date,
          newUsers: period.newUsers,
          totalUsers: cumulativeTotal
        };
      });

      setData(processedData);
    } catch (err) {
      console.error("Error fetching user growth data:", err);
      setError("Failed to load user growth data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    recentUsersCount
  };
};

