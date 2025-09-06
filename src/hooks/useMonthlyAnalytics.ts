import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockMenuData } from '@/data/menuData';

export interface MonthlyAnalytics {
  totalRevenue: number;
  totalOrders: number;
  activeStudents: number;
  averageOrderValue: number;
  weeklyData: Array<{
    week: string;
    orders: number;
    revenue: number;
  }>;
  studentBilling: Array<{
    studentName: string;
    grade: string;
    parentName: string;
    ordersCount: number;
    totalAmount: number;
  }>;
}

export const useMonthlyAnalytics = (year: number, month: number) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<MonthlyAnalytics>({
    totalRevenue: 0,
    totalOrders: 0,
    activeStudents: 0,
    averageOrderValue: 0,
    weeklyData: [],
    studentBilling: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get meal price from meal name
  const getMealPrice = (mealName: string): number => {
    // Map meal names to prices from mock data
    for (const day of mockMenuData.days) {
      const allMeals = [...day.meal1Options, ...day.meal2Options, ...day.sideOptions];
      const meal = allMeals.find(m => m.name === mealName);
      if (meal) return meal.price;
    }
    
    // Default prices for unknown meals
    const defaultPrices: Record<string, number> = {
      'Борщ український з сметаною': 45,
      'Котлета куряча з картопляним пюре': 55,
      'Салат з свіжих овочів': 20,
      'Голубці з м\'ясом': 60,
      'Винегрет': 25
    };
    
    return defaultPrices[mealName] || 40; // Default meal price
  };

  useEffect(() => {
    if (user) {
      fetchMonthlyAnalytics();
    }
  }, [user, year, month]);

  const fetchMonthlyAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Get month start and end dates
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const startDateStr = monthStart.toISOString().split('T')[0];
      const endDateStr = monthEnd.toISOString().split('T')[0];

      // Fetch all meal orders for the month
      const { data: orders, error: ordersError } = await supabase
        .from('meal_orders')
        .select('*')
        .gte('meal_date', startDateStr)
        .lte('meal_date', endDateStr);

      if (ordersError) {
        throw new Error(ordersError.message);
      }

      if (!orders || orders.length === 0) {
        setAnalytics({
          totalRevenue: 0,
          totalOrders: 0,
          activeStudents: 0,
          averageOrderValue: 0,
          weeklyData: [],
          studentBilling: []
        });
        setLoading(false);
        return;
      }

      // Get unique child IDs
      const childIds = [...new Set(orders.map(order => order.child_id))];
      
      // Fetch children data
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, name, grade, parent_id')
        .in('id', childIds);

      if (childrenError) {
        throw new Error(childrenError.message);
      }

      // Get unique parent IDs  
      const parentIds = [...new Set((children || []).map(child => child.parent_id))];
      
      // Fetch parent profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', parentIds);

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      // Create lookup maps
      const childrenMap = new Map((children || []).map(child => [child.id, child]));
      const profilesMap = new Map((profiles || []).map(profile => [profile.user_id, profile]));

      // Calculate total revenue and orders
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + getMealPrice(order.meal_name);
      }, 0);
      
      const totalOrders = orders.length;
      
      // Calculate unique active students
      const uniqueStudents = new Set(orders.map(order => order.child_id));
      const activeStudents = uniqueStudents.size;
      
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Calculate weekly data
      const weeklyMap = new Map();
      
      orders.forEach(order => {
        const orderDate = new Date(order.meal_date);
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        
        const weekKey = `${weekStart.getDate().toString().padStart(2, '0')}.${(weekStart.getMonth() + 1).toString().padStart(2, '0')} - ${weekEnd.getDate().toString().padStart(2, '0')}.${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, { orders: 0, revenue: 0 });
        }
        
        const weekData = weeklyMap.get(weekKey);
        weekData.orders += 1;
        weekData.revenue += getMealPrice(order.meal_name);
      });

      const weeklyData = Array.from(weeklyMap.entries()).map(([week, data]) => ({
        week,
        orders: data.orders,
        revenue: data.revenue
      }));

      // Calculate student billing
      const studentBillingMap = new Map();
      
      orders.forEach(order => {
        const childData = childrenMap.get(order.child_id);
        if (!childData) return;
        
        const parentData = profilesMap.get(childData.parent_id);
        
        const childId = order.child_id;
        if (!studentBillingMap.has(childId)) {
          studentBillingMap.set(childId, {
            studentName: childData.name || 'Невідомо',
            grade: childData.grade || 'Невідомо',
            parentName: parentData?.full_name || 'Невідомо',
            ordersCount: 0,
            totalAmount: 0
          });
        }
        
        const billing = studentBillingMap.get(childId);
        billing.ordersCount += 1;
        billing.totalAmount += getMealPrice(order.meal_name);
      });

      const studentBilling = Array.from(studentBillingMap.values());

      setAnalytics({
        totalRevenue,
        totalOrders,
        activeStudents,
        averageOrderValue,
        weeklyData,
        studentBilling
      });

    } catch (err) {
      console.error('Error fetching monthly analytics:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, refetch: fetchMonthlyAnalytics };
};