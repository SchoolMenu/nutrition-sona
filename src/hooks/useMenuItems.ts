import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DayMenu, MenuItem } from '@/data/menuData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMenuItems = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const saveMenuToDatabase = useCallback(async (weekMenu: DayMenu[]) => {
    console.log('Starting save operation with weekMenu:', weekMenu);
    setSaving(true);
    try {
      // First, delete existing menu items for this week
      const weekStart = new Date(weekMenu[0].date);
      const weekEnd = new Date(weekMenu[weekMenu.length - 1].date);
      
      console.log('Week range:', weekStart.toISOString().split('T')[0], 'to', weekEnd.toISOString().split('T')[0]);
      
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .gte('menu_date', weekStart.toISOString().split('T')[0])
        .lte('menu_date', weekEnd.toISOString().split('T')[0]);

      if (deleteError) throw deleteError;

      // Prepare all menu items for insertion
      const menuItemsToInsert = [];
      console.log('Preparing to insert items for', weekMenu.length, 'days');
      
      for (const day of weekMenu) {
        const dayDate = new Date(day.date).toISOString().split('T')[0];
        
        // Add meal1 options
        for (const item of day.meal1Options) {
          menuItemsToInsert.push({
            name: item.name,
            description: item.description,
            price: item.price,
            allergens: item.allergens,
            category: 'meal1',
            day_name: day.dayName,
            menu_date: dayDate,
            school_code: profile?.school_code || ''
          });
        }
        
        // Add meal2 options
        for (const item of day.meal2Options) {
          menuItemsToInsert.push({
            name: item.name,
            description: item.description,
            price: item.price,
            allergens: item.allergens,
            category: 'meal2',
            day_name: day.dayName,
            menu_date: dayDate,
            school_code: profile?.school_code || ''
          });
        }
        
        // Add side options
        for (const item of day.sideOptions) {
          menuItemsToInsert.push({
            name: item.name,
            description: item.description,
            price: item.price,
            allergens: item.allergens,
            category: 'side',
            day_name: day.dayName,
            menu_date: dayDate,
            school_code: profile?.school_code || ''
          });
        }
      }

      // Insert all menu items
      console.log('Inserting', menuItemsToInsert.length, 'items:', menuItemsToInsert);
      const { error: insertError } = await supabase
        .from('menu_items')
        .insert(menuItemsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Успіх!",
        description: "Меню успішно збережено в базі даних",
      });

      return true;
    } catch (error) {
      console.error('Error saving menu:', error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося зберегти меню: " + (error as Error).message,
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast, profile?.school_code]);

  const loadMenuFromDatabase = useCallback(async (weekStart: string, weekEnd: string): Promise<DayMenu[] | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .gte('menu_date', weekStart)
        .lte('menu_date', weekEnd)
        .order('menu_date');

      if (error) throw error;

      if (!data || data.length === 0) {
        return null; // No data found, use mock data
      }

      // Group items by date
      const itemsByDate = new Map<string, any[]>();
      data.forEach(item => {
        const date = item.menu_date;
        if (!itemsByDate.has(date)) {
          itemsByDate.set(date, []);
        }
        itemsByDate.get(date)!.push(item);
      });

      // Convert to DayMenu format
      const dayMenus: DayMenu[] = [];
      for (const [date, items] of itemsByDate.entries()) {
        const dayName = items[0]?.day_name || new Date(date).toLocaleDateString('uk-UA', { weekday: 'long' });
        
        const dayMenu: DayMenu = {
          date,
          dayName,
          meal1Options: [],
          meal2Options: [],
          sideOptions: []
        };

        items.forEach(item => {
          const menuItem: MenuItem = {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            allergens: item.allergens || [],
            category: item.category
          };

          switch (item.category) {
            case 'meal1':
              dayMenu.meal1Options.push(menuItem);
              break;
            case 'meal2':
              dayMenu.meal2Options.push(menuItem);
              break;
            case 'side':
              dayMenu.sideOptions.push(menuItem);
              break;
          }
        });

        dayMenus.push(dayMenu);
      }

      return dayMenus;
    } catch (error) {
      console.error('Error loading menu:', error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося завантажити меню з бази даних",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    saving,
    saveMenuToDatabase,
    loadMenuFromDatabase
  };
};