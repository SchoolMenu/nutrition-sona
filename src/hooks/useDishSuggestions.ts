import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DishSuggestion {
  name: string;
  price: number;
  description: string;
  allergens: string[];
}

export const useDishSuggestions = () => {
  const [loading, setLoading] = useState(false);

  const findSimilarDish = async (dishName: string): Promise<DishSuggestion | null> => {
    if (!dishName || dishName.trim().length < 3) {
      return null;
    }

    setLoading(true);
    try {
      // Search for dishes with similar names (case insensitive)
      const { data, error } = await supabase
        .from('menu_items')
        .select('name, price, description, allergens')
        .ilike('name', `%${dishName.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const dish = data[0];
        return {
          name: dish.name,
          price: parseFloat(dish.price.toString()),
          description: dish.description || '',
          allergens: dish.allergens || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding similar dish:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (dishName: string): Promise<DishSuggestion[]> => {
    if (!dishName || dishName.trim().length < 2) {
      return [];
    }

    setLoading(true);
    try {
      // Get multiple suggestions for autocomplete
      const { data, error } = await supabase
        .from('menu_items')
        .select('name, price, description, allergens')
        .ilike('name', `%${dishName.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        return data.map(dish => ({
          name: dish.name,
          price: parseFloat(dish.price.toString()),
          description: dish.description || '',
          allergens: dish.allergens || []
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    findSimilarDish,
    getSuggestions
  };
};