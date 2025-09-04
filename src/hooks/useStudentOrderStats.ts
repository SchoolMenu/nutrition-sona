import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StudentOrderStats {
  totalStudents: number;
  studentsWithOrders: number;
  studentsWithoutOrders: number;
  orderParticipationRate: number;
  dishChoiceStats: {
    dishName: string;
    studentCount: number;
    students: {
      name: string;
      grade: string;
    }[];
  }[];
}

export const useStudentOrderStats = (date: string = new Date().toISOString().split('T')[0]) => {
  const [stats, setStats] = useState<StudentOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching stats for date:', date);

        // Get total registered students
        const { data: totalChildren, error: childrenError } = await supabase
          .from('children')
          .select('id, name, grade');

        if (childrenError) throw childrenError;

        const totalStudents = totalChildren?.length || 0;
        console.log('Total students found:', totalStudents, totalChildren);

        // Get students who have orders for the selected date
        const { data: ordersWithChildren, error: ordersError } = await supabase
          .from('meal_orders')
          .select(`
            child_id,
            meal_name,
            meal_type,
            children!fk_meal_orders_child (
              name,
              grade
            )
          `)
          .eq('meal_date', date);

        if (ordersError) throw ordersError;

        console.log('Orders found for date:', date, ordersWithChildren);

        // Get unique students who have orders
        const studentsWithOrdersSet = new Set();
        const dishChoiceMap = new Map<string, { students: Set<string>, studentDetails: { name: string, grade: string }[] }>();

        ordersWithChildren?.forEach((order: any) => {
          if (order.children) {
            studentsWithOrdersSet.add(order.child_id);
            
            // Use actual meal name from the order
            const dishName = order.meal_name;
            
            if (!dishChoiceMap.has(dishName)) {
              dishChoiceMap.set(dishName, { students: new Set(), studentDetails: [] });
            }
            
            const dishStats = dishChoiceMap.get(dishName)!;
            if (!dishStats.students.has(order.child_id)) {
              dishStats.students.add(order.child_id);
              dishStats.studentDetails.push({
                name: order.children.name,
                grade: order.children.grade
              });
            }
          }
        });

        const studentsWithOrders = studentsWithOrdersSet.size;
        const studentsWithoutOrders = totalStudents - studentsWithOrders;
        const orderParticipationRate = totalStudents > 0 ? (studentsWithOrders / totalStudents) * 100 : 0;

        const dishChoiceStats = Array.from(dishChoiceMap.entries()).map(([dishName, dishData]) => ({
          dishName,
          studentCount: dishData.students.size,
          students: dishData.studentDetails
        }));

        const finalStats = {
          totalStudents,
          studentsWithOrders,
          studentsWithoutOrders,
          orderParticipationRate,
          dishChoiceStats
        };

        console.log('Final calculated stats:', finalStats);
        setStats(finalStats);

      } catch (err) {
        console.error('Error fetching student order stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [date]);

  return { stats, loading, error };
};