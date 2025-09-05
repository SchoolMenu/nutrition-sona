import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, Check, Save, CalendarDays } from "lucide-react";
import { mockMenuData, type MenuItem, type DayMenu } from "@/data/menuData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuItems } from "@/hooks/useMenuItems";
import { getWeekDates } from "@/lib/weekUtils";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
}

interface MenuViewProps {
  selectedChildId?: string;
  onOrdersChange?: () => void;
}

export const MenuView = ({ selectedChildId, onOrdersChange }: MenuViewProps) => {
  const { user, profile } = useAuth();
  const { loadMenuFromDatabase } = useMenuItems();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [currentChild, setCurrentChild] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<Record<string, string[]>>({});
  const [pendingSelections, setPendingSelections] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuData, setMenuData] = useState<DayMenu[]>(mockMenuData.days);
  const [weekInfo, setWeekInfo] = useState({ weekStart: mockMenuData.weekStart, weekEnd: mockMenuData.weekEnd });
  
  const currentDay = menuData[selectedDayIndex];

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMenuData();
    }
  }, [user, selectedWeekOffset]);

  const loadMenuData = async () => {
    const { start, end, startDate, endDate } = getWeekDates(selectedWeekOffset);
    
    try {
      const dbMenuData = await loadMenuFromDatabase(start, end);
      
      // Always generate all 5 days of the week structure  
      const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця"];
      const fullWeekMenu: DayMenu[] = [];
      
      for (let i = 0; i < 5; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        const dateStr = currentDay.toISOString().split('T')[0];
        
        // Find existing data for this date
        const existingDay = dbMenuData?.find(day => day.date === dateStr);
        
        if (existingDay) {
          // Use existing data
          fullWeekMenu.push(existingDay);
        } else {
          // Create empty day structure
          fullWeekMenu.push({
            date: dateStr,
            dayName: dayNames[i],
            meal1Options: [],
            meal2Options: [],
            sideOptions: []
          });
        }
      }
      
      setMenuData(fullWeekMenu);
      setWeekInfo({
        weekStart: startDate.toLocaleDateString('uk-UA'),
        weekEnd: endDate.toLocaleDateString('uk-UA')
      });
    } catch (error) {
      console.error('Error loading menu data:', error);
      // Keep using mock data as fallback
    }
  };

  useEffect(() => {
    if (selectedChildId && children.length > 0) {
      setCurrentChild(selectedChildId);
    }
  }, [selectedChildId, children]);

  // Load existing meal orders when child or day changes
  useEffect(() => {
    if (currentChild && currentDay) {
      loadExistingOrders();
    }
  }, [currentChild, currentDay?.date]);

  // Clear pending selections when changing days or children
  useEffect(() => {
    setPendingSelections({});
  }, [selectedDayIndex, currentChild]);

  const loadExistingOrders = async () => {
    if (!currentChild || !currentDay) return;

    try {
      const { data, error } = await supabase
        .from('meal_orders' as any)
        .select('meal_name, meal_type')
        .eq('child_id', currentChild)
        .eq('meal_date', currentDay.date);

      if (error) throw error;

      // Update selected meals state
      const newSelectedMeals: Record<string, string[]> = {};
      (data as any[])?.forEach((order: any) => {
        const key = `${currentDay.date}-${order.meal_type}`;
        if (!newSelectedMeals[key]) {
          newSelectedMeals[key] = [];
        }
        newSelectedMeals[key].push(order.meal_name);
      });

      setSelectedMeals(prev => ({
        ...prev,
        ...newSelectedMeals
      }));
    } catch (error) {
      console.error('Error loading existing orders:', error);
    }
  };

  const fetchChildren = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('children' as any)
      .select('*')
      .eq('parent_id', user.id);
    
    if (error) {
      return;
    }
    
    setChildren((data as any[]) || []);
    if (data && data.length > 0) {
      setCurrentChild((data[0] as any).id);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    } else if (direction === 'next' && selectedDayIndex < menuData.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const handleWeekChange = (offset: number) => {
    setSelectedWeekOffset(offset);
    setSelectedDayIndex(0); // Reset to Monday when changing weeks
    setPendingSelections({}); // Clear pending selections
  };

  const getCurrentWeekLabel = () => {
    const { startDate, endDate } = getWeekDates(selectedWeekOffset);
    const startStr = startDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    
    if (selectedWeekOffset === 0) {
      return `Поточний тиждень (${startStr} - ${endStr})`;
    } else if (selectedWeekOffset === 1) {
      return `Наступний тиждень (${startStr} - ${endStr})`;
    } else if (selectedWeekOffset > 1) {
      return `Через ${selectedWeekOffset} тижнів (${startStr} - ${endStr})`;
    } else if (selectedWeekOffset === -1) {
      return `Минулий тиждень (${startStr} - ${endStr})`;
    } else {
      return `${Math.abs(selectedWeekOffset)} тижнів назад (${startStr} - ${endStr})`;
    }
  };

  const formatPrice = (price: number) => `${price} грн`;

  const handleMealSelection = (meal: MenuItem, mealType: string) => {
    if (!currentChild) {
      return;
    }

    const key = `${currentDay.date}-${mealType}`;
    
    // For side dishes, allow multiple selections (up to 2)
    if (mealType === 'side') {
      setPendingSelections(prev => {
        const currentSelections = prev[key] || [];
        const isSelected = currentSelections.includes(meal.name);
        
        if (isSelected) {
          // Remove if already selected
          return {
            ...prev,
            [key]: currentSelections.filter(name => name !== meal.name)
          };
        } else if (currentSelections.length < 2) {
          // Add if less than 2 items selected
          return {
            ...prev,
            [key]: [...currentSelections, meal.name]
          };
        }
        // Don't add if already 2 items selected
        return prev;
      });
    } else {
      // For main dishes, only one selection allowed
      setPendingSelections(prev => ({
        ...prev,
        [key]: [meal.name]
      }));
    }
  };

  const saveSelections = async () => {
    if (!currentChild || !currentDay) {
      return;
    }

    setSaving(true);

    try {
      // Remove all existing orders for this day
      await supabase
        .from('meal_orders' as any)
        .delete()
        .eq('child_id', currentChild)
        .eq('meal_date', currentDay.date);

      // Insert new orders from pending selections
      const ordersToInsert = Object.entries(pendingSelections)
        .filter(([key]) => key.startsWith(currentDay.date))
        .flatMap(([key, meals]) => {
          const mealType = key.split('-').slice(1).join('-');
          return meals.map(mealName => ({
            child_id: currentChild,
            meal_name: mealName,
            meal_date: currentDay.date,
            meal_type: mealType,
            school_code: profile?.school_code || ''
          }));
        });

      if (ordersToInsert.length > 0) {
        const { error } = await supabase
          .from('meal_orders' as any)
          .insert(ordersToInsert);

        if (error) throw error;
      }

      // Update selected meals state with the saved selections
      const newSelectedMeals = { ...selectedMeals };
      Object.entries(pendingSelections).forEach(([key, meals]) => {
        if (key.startsWith(currentDay.date)) {
          newSelectedMeals[key] = meals;
        }
      });
      setSelectedMeals(newSelectedMeals);

      // Clear pending selections for this day
      const clearedPending = { ...pendingSelections };
      Object.keys(clearedPending).forEach(key => {
        if (key.startsWith(currentDay.date)) {
          delete clearedPending[key];
        }
      });
      setPendingSelections(clearedPending);

      toast.success("Вибір збережено!");

      // Refresh statistics
      if (onOrdersChange) {
        onOrdersChange();
      }
    } catch (error) {
      console.error('Error saving selections:', error);
      toast.error("Помилка при збереженні вибору");
    }

    setSaving(false);
  };

  const getCurrentSelections = (mealType: string) => {
    const key = `${currentDay.date}-${mealType}`;
    return pendingSelections[key] || selectedMeals[key] || [];
  };

  const hasUnsavedChanges = () => {
    return Object.keys(pendingSelections).some(key => 
      key.startsWith(currentDay.date) && pendingSelections[key].length > 0
    );
  };

  const isChildAllergic = (meal: MenuItem, child: Child) => {
    return meal.allergens.some(allergen => child.allergies.includes(allergen));
  };

  const selectedChildObj = children.find(c => c.id === currentChild);

  if (children.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Немає доданих дітей</h2>
        <p className="text-muted-foreground">Додайте дитину в профілі для замовлення обідів</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Child Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Оберіть дитину</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currentChild} onValueChange={setCurrentChild}>
            <SelectTrigger>
              <SelectValue placeholder="Оберіть дитину" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} - {child.grade} клас
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Week Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Меню на тиждень</CardTitle>
              <CardDescription>
                {getCurrentWeekLabel()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(selectedWeekOffset - 1)}
                disabled={selectedWeekOffset <= -4} // Limit to 4 weeks back
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(0)}
                disabled={selectedWeekOffset === 0}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(selectedWeekOffset + 1)}
                disabled={selectedWeekOffset >= 4} // Limit to 4 weeks ahead
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Day Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('prev')}
              disabled={selectedDayIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">{currentDay.dayName}</h3>
              <p className="text-sm text-muted-foreground">{currentDay.date}</p>
              {hasUnsavedChanges() && (
                <p className="text-xs text-warning">Є незбережені зміни</p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
            onClick={() => navigateDay('next')}
            disabled={selectedDayIndex === menuData.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {currentChild && (
        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={saveSelections}
              disabled={saving || !hasUnsavedChanges()}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Збереження...' : 'Зберегти вибір'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Menu Options */}
      <div className="space-y-4">
        {/* Meal 1 Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Перша страва
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.meal1Options.map((meal) => (
              <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{meal.name}</h4>
                  <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{meal.description}</p>
                {meal.allergens.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {meal.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleMealSelection(meal, 'meal1')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('meal1').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('meal1').includes(meal.name)
                    ? 'Обрано'
                    : 'Вибрати'
                  }
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meal 2 Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Друга страва
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.meal2Options.map((meal) => (
              <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{meal.name}</h4>
                  <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{meal.description}</p>
                {meal.allergens.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {meal.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleMealSelection(meal, 'meal2')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('meal2').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('meal2').includes(meal.name)
                    ? 'Обрано'
                    : 'Вибрати'
                  }
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Side Options */}
        {currentDay.sideOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Додатково (можна обрати до 2 страв)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentDay.sideOptions.map((meal) => (
                <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{meal.name}</h4>
                    <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                  {meal.allergens.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      {meal.allergens.map((allergen) => (
                        <Badge key={allergen} variant="secondary" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleMealSelection(meal, 'side')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('side').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('side').includes(meal.name)
                    ? 'Обрано'
                    : getCurrentSelections('side').length >= 2 && !getCurrentSelections('side').includes(meal.name)
                    ? 'Макс. 2 страви'
                    : 'Вибрати'
                  }
                </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};