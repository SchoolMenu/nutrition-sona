import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockMenuData } from '@/data/menuData';

export interface OrderStatistics {
  weeklySpent: number;
  mealsThisWeek: number;
  upcomingMeals: number;
  monthlySpent: number;
  monthlyBudget: number;
  remainingBudget: number;
}

export const useOrderStatistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStatistics>({
    weeklySpent: 0,
    mealsThisWeek: 0,
    upcomingMeals: 0,
    monthlySpent: 0,
    monthlyBudget: 1500, // Default budget
    remainingBudget: 1500
  });
  const [loading, setLoading] = useState(true);

  // Get meal price from mock data (fallback)
  const getMealPrice = (mealId: string): number => {
    for (const day of mockMenuData.days) {
      const allMeals = [...day.meal1Options, ...day.meal2Options, ...day.sideOptions];
      const meal = allMeals.find(m => m.id === mealId);
      if (meal) return meal.price;
    }
    return 0; // Default if not found
  };

  useEffect(() => {
    if (user) {
      calculateStatistics();
      // Set up interval to refresh every 30 seconds when there are active users
      const interval = setInterval(calculateStatistics, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const calculateStatistics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get current week dates (Monday to Sunday)
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Get current month dates
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Get user's children
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id);

      if (childrenError || !children) {
        setLoading(false);
        return;
      }

      const childIds = children.map(child => child.id);

      if (childIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get this week's orders
      const { data: weekOrders, error: weekError } = await supabase
        .from('meal_orders')
        .select('*')
        .in('child_id', childIds)
        .gte('meal_date', monday.toISOString().split('T')[0])
        .lte('meal_date', sunday.toISOString().split('T')[0]);

      // Get this month's orders
      const { data: monthOrders, error: monthError } = await supabase
        .from('meal_orders')
        .select('*')
        .in('child_id', childIds)
        .gte('meal_date', monthStart.toISOString().split('T')[0])
        .lte('meal_date', monthEnd.toISOString().split('T')[0]);

      if (weekError || monthError) {
        console.error('Error fetching orders:', weekError || monthError);
        setLoading(false);
        return;
      }

      // Calculate weekly stats
      const weeklySpent = (weekOrders || []).reduce((sum, order) => {
        return sum + getMealPrice(order.meal_id);
      }, 0);

      const mealsThisWeek = (weekOrders || []).length;

      // Calculate upcoming meals (remaining days this week)
      const remainingDaysThisWeek = Math.max(0, 7 - (today.getDay() === 0 ? 7 : today.getDay()));
      const upcomingMeals = (weekOrders || []).filter(order => {
        const orderDate = new Date(order.meal_date);
        return orderDate > today;
      }).length;

      // Calculate monthly stats
      const monthlySpent = (monthOrders || []).reduce((sum, order) => {
        return sum + getMealPrice(order.meal_id);
      }, 0);

      const monthlyBudget = 1500; // This could be fetched from user preferences
      const remainingBudget = monthlyBudget - monthlySpent;

      setStats({
        weeklySpent,
        mealsThisWeek,
        upcomingMeals,
        monthlySpent,
        monthlyBudget,
        remainingBudget
      });

    } catch (error) {
      console.error('Error calculating statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: calculateStatistics };
};