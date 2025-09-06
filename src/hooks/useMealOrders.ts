import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MealOrderWithDetails {
  id: string;
  child_id: string;
  meal_date: string;
  meal_name: string;
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
  mainMeal: string; // Комплексний обід (обов'язково)
  fruitBreak?: string; // Фруктова перерва (опційно)
  afternoonSnack?: string; // Підвечірок (опційно)
  allergies: string[];
  specialNotes?: string;
}

export const useMealOrders = (date: string) => {
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealOrders = async () => {
      console.log('Fetching meal orders for date:', date);
      setLoading(true);
      setError(null);

      try {
        // Use the new database function which has SECURITY DEFINER
        const { data: rawOrders, error: ordersError } = await supabase
          .rpc('get_meal_orders_for_date', { 
            target_date: date 
          });

        console.log('Function result:', rawOrders, 'Error:', ordersError);

        if (ordersError) {
          console.error('Function error:', ordersError);
          throw ordersError;
        }

        if (!rawOrders || rawOrders.length === 0) {
          console.log('No orders found for date:', date);
          setOrders([]);
          setLoading(false);
          return;
        }

        // Process the orders from the function result
        const processedOrders = processMealOrders(rawOrders);
        console.log('Processed orders:', processedOrders);
        setOrders(processedOrders);

      } catch (err) {
        console.error('Error fetching meal orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch meal orders');
      } finally {
        setLoading(false);
      }
    };

    fetchMealOrders();
  }, [date]);

  const processMealOrders = (rawOrders: any[]): StudentOrder[] => {
    // Group orders by child and convert to StudentOrder format
    const ordersByChild = new Map<string, {
      studentId: string;
      studentName: string;
      grade: string;
      allergies: string[];
      mainMeal?: string;
      fruitBreak?: string;
      afternoonSnack?: string;
    }>();

    rawOrders.forEach((order: any) => {
      const childId = order.child_id;
      const dishName = order.meal_name;
      const childName = order.child_name;
      const childGrade = order.child_grade;
      const childAllergies = order.child_allergies || [];

      if (!childName) {
        console.log('No child name for order:', order);
        return;
      }

      if (!ordersByChild.has(childId)) {
        ordersByChild.set(childId, {
          studentId: childId,
          studentName: childName,
          grade: `${childGrade}`,
          allergies: childAllergies,
        });
      }

      const studentOrder = ordersByChild.get(childId)!;
      
      switch (order.meal_type) {
        case 'main_meal':
          studentOrder.mainMeal = dishName;
          break;
        case 'fruit_break':
          studentOrder.fruitBreak = dishName;
          break;
        case 'afternoon_snack':
          studentOrder.afternoonSnack = dishName;
          break;
      }
    });

    // Convert to array and filter out incomplete orders
    const studentOrders: StudentOrder[] = Array.from(ordersByChild.values())
      .filter(order => order.mainMeal) // Require at least mainMeal
      .map(order => ({
        ...order,
        mainMeal: order.mainMeal!,
      }));

    return studentOrders;
  };

  return { orders, loading, error };
};