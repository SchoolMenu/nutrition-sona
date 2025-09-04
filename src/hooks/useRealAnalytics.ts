import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealAnalytics {
  totalRevenue: number;
  totalOrders: number;
  activeStudents: number;
  averageOrderValue: number;
  weeklyData: { week: string; revenue: number; orders: number }[];
  studentBilling: { 
    studentName: string; 
    grade: string; 
    ordersCount: number; 
    totalAmount: number;
    parentName: string;
  }[];
}

export const useRealAnalytics = () => {
  const [analytics, setAnalytics] = useState<RealAnalytics>({
    totalRevenue: 0,
    totalOrders: 0,
    activeStudents: 0,
    averageOrderValue: 0,
    weeklyData: [],
    studentBilling: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get meal price from meal name (using the same logic as useOrderStatistics)
  const getMealPrice = (mealName: string): number => {
    const defaultPrices: Record<string, number> = {
      'Борщ український з сметаною': 45,
      'Котлета куряча з картоплею': 55,
      'Салат з свіжих овочів': 20,
      'Голубці з м\'ясом': 60,
      'Винегрет': 25,
      'Суп з куркою та локшиною': 40,
      'Риба запечена з овочами': 65,
      'Салат з огірків': 15,
      'Гречана каша з м\'ясом': 35,
      'Компот з сухофруктів': 10,
      'Хліб житній': 5
    };
    
    return defaultPrices[mealName] || 40; // Default meal price
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current month dates
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get all orders for current month
        const { data: orders, error: ordersError } = await supabase
          .from('meal_orders')
          .select('*')
          .gte('meal_date', monthStart.toISOString().split('T')[0])
          .lte('meal_date', monthEnd.toISOString().split('T')[0]);

        if (ordersError) throw ordersError;

        // Get all children
        const { data: children, error: childrenError } = await supabase
          .from('children')
          .select('*');

        if (childrenError) throw childrenError;

        // Get all parent profiles
        const parentIds = [...new Set((children || []).map(child => child.parent_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', parentIds);

        if (profilesError) throw profilesError;

        // Create a map for quick profile lookup
        const profileMap = new Map((profiles || []).map(profile => [profile.user_id, profile.full_name]));

        // Calculate analytics
        const totalOrders = orders?.length || 0;
        const totalRevenue = (orders || []).reduce((sum, order) => {
          return sum + getMealPrice(order.meal_name);
        }, 0);

        // Get unique students with orders this month
        const studentsWithOrders = new Set((orders || []).map(order => order.child_id));
        const activeStudents = studentsWithOrders.size;

        const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // Calculate weekly data for current month
        const weeklyData = [];
        const weeksInMonth = Math.ceil((monthEnd.getDate() - monthStart.getDate() + 1) / 7);
        
        for (let week = 0; week < weeksInMonth; week++) {
          const weekStart = new Date(monthStart);
          weekStart.setDate(monthStart.getDate() + week * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekOrders = (orders || []).filter(order => {
            const orderDate = new Date(order.meal_date);
            return orderDate >= weekStart && orderDate <= weekEnd;
          });
          
          const weekRevenue = weekOrders.reduce((sum, order) => sum + getMealPrice(order.meal_name), 0);
          
          weeklyData.push({
            week: `Тиждень ${week + 1} (${weekStart.getDate()}-${weekEnd.getDate()} ${monthStart.toLocaleString('uk', { month: 'long' })})`,
            revenue: weekRevenue,
            orders: weekOrders.length
          });
        }

        // Calculate student billing
        const studentBilling = (children || []).map(child => {
          const childOrders = (orders || []).filter(order => order.child_id === child.id);
          const totalAmount = childOrders.reduce((sum, order) => sum + getMealPrice(order.meal_name), 0);
          
          return {
            studentName: child.name,
            grade: child.grade,
            ordersCount: childOrders.length,
            totalAmount,
            parentName: profileMap.get(child.parent_id) || 'Невідомо'
          };
        }).filter(student => student.ordersCount > 0)
          .sort((a, b) => b.totalAmount - a.totalAmount);

        setAnalytics({
          totalRevenue,
          totalOrders,
          activeStudents,
          averageOrderValue,
          weeklyData,
          studentBilling
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
};