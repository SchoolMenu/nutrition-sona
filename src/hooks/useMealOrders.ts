import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockMenuData } from '@/data/menuData';

export interface MealOrderWithDetails {
  id: string;
  child_id: string;
  meal_date: string;
  meal_id: string;
  meal_type: string;
  child_name: string;
  child_grade: string;
  dish_name: string;
  child_allergies: string[];
}

export interface StudentOrder {
  studentId: string;
  studentName: string;
  grade: string;
  meal1: string;
  meal2: string;
  side?: string;
  allergies: string[];
  specialNotes?: string;
}

export const useMealOrders = (date: string) => {
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a mapping from meal ID to dish name
  const getMealName = (mealId: string): string => {
    for (const day of mockMenuData.days) {
      const allMeals = [...day.meal1Options, ...day.meal2Options, ...day.sideOptions];
      const meal = allMeals.find(m => m.id === mealId);
      if (meal) return meal.name;
    }
    return `Unknown dish (${mealId})`;
  };

  useEffect(() => {
    const fetchMealOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch meal orders for the specified date with child information
        const { data: rawOrders, error: ordersError } = await supabase
          .from('meal_orders')
          .select(`
            id,
            child_id,
            meal_date,
            meal_id,
            meal_type,
            children!fk_meal_orders_child (
              name,
              grade,
              allergies
            )
          `)
          .eq('meal_date', date);

        if (ordersError) {
          throw ordersError;
        }

        if (!rawOrders || rawOrders.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Group orders by child and convert to StudentOrder format
        const ordersByChild = new Map<string, {
          studentId: string;
          studentName: string;
          grade: string;
          allergies: string[];
          meal1?: string;
          meal2?: string;
          side?: string;
        }>();

        rawOrders.forEach((order: any) => {
          const childData = order.children;
          if (!childData) return;

          const childId = order.child_id;
          const dishName = getMealName(order.meal_id);

          if (!ordersByChild.has(childId)) {
            ordersByChild.set(childId, {
              studentId: childId,
              studentName: childData.name,
              grade: `${childData.grade}`,
              allergies: childData.allergies || [],
            });
          }

          const studentOrder = ordersByChild.get(childId)!;
          
          switch (order.meal_type) {
            case 'meal1':
              studentOrder.meal1 = dishName;
              break;
            case 'meal2':
              studentOrder.meal2 = dishName;
              break;
            case 'side':
              studentOrder.side = dishName;
              break;
          }
        });

        // Convert to array and filter out incomplete orders
        const studentOrders: StudentOrder[] = Array.from(ordersByChild.values())
          .filter(order => order.meal1 && order.meal2) // Require at least meal1 and meal2
          .map(order => ({
            ...order,
            meal1: order.meal1!,
            meal2: order.meal2!,
          }));

        setOrders(studentOrders);
      } catch (err) {
        console.error('Error fetching meal orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch meal orders');
      } finally {
        setLoading(false);
      }
    };

    fetchMealOrders();
  }, [date]);

  return { orders, loading, error };
};