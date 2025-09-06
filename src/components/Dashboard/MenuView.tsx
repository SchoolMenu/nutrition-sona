import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, Check, Save, CalendarDays, Apple } from "lucide-react";
import { mockMenuData, type MenuItem, type DayMenu } from "@/data/menuData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuItems } from "@/hooks/useMenuItems";
import { getWeekDates } from "@/lib/weekUtils";
import { toast } from "sonner";
import { HelpTooltip } from "./HelpTooltip";

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
            mainMealOptions: [],
            fruitBreakOptions: [],
            afternoonSnackOptions: []
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
    
    // For afternoon snacks, allow multiple selections (up to 2)
    if (mealType === 'afternoon_snack') {
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
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Оберіть дитину</CardTitle>
            <HelpTooltip content="Виберіть дитину, для якої хочете замовити обіди. Ви можете перемикатися між дітьми в будь-який час." />
          </div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-xl">Меню на тиждень</CardTitle>
                <HelpTooltip content="Використовуйте стрілки для вибору тижня. Ви можете замовляти обіди до 4 тижнів наперед або переглядати попередні замовлення." />
              </div>
              <CardDescription className="text-sm">
                {getCurrentWeekLabel()}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(selectedWeekOffset - 1)}
                disabled={selectedWeekOffset <= -4}
                className="px-2 sm:px-3 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Попередній</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(0)}
                disabled={selectedWeekOffset === 0}
                className="px-2 sm:px-3 w-full sm:w-auto"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Сьогодні</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange(selectedWeekOffset + 1)}
                disabled={selectedWeekOffset >= 4}
                className="px-2 sm:px-3 w-full sm:w-auto"
              >
                <span className="text-xs sm:text-sm">Наступний</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Day Navigation */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('prev')}
              disabled={selectedDayIndex === 0}
              className="px-3 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Попередній день</span>
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">{currentDay?.dayName}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {new Date(currentDay?.date || '').toLocaleDateString('uk-UA', { 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('next')}
              disabled={selectedDayIndex === menuData.length - 1}
              className="px-3 w-full sm:w-auto"
            >
              <span className="text-xs sm:text-sm">Наступний день</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-4">
        {/* Meal 1 Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Обід
              </CardTitle>
              <HelpTooltip content="Виберіть одну головну страву для обіду. Страви з алергенами будуть заблоковані, якщо у дитини є відповідні алергії." />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.mainMealOptions.map((meal) => (
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
                  onClick={() => handleMealSelection(meal, 'main_meal')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('main_meal').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('main_meal').includes(meal.name)
                    ? 'Обрано'
                    : 'Вибрати'
                  }
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fruit Break Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Apple className="h-5 w-5" />
                Фруктова перерва (опційно)
              </CardTitle>
              <HelpTooltip content="Фруктова перерва - це необов'язкова опція. Можете вибрати або пропустити." />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.fruitBreakOptions.map((meal) => (
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
                  onClick={() => handleMealSelection(meal, 'fruit_break')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('fruit_break').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('fruit_break').includes(meal.name)
                    ? 'Обрано'
                    : 'Вибрати'
                  }
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Afternoon Snack Options */}
        {currentDay.afternoonSnackOptions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Підвечірок (опційно)
                </CardTitle>
                <HelpTooltip content="Підвечірок - це необов'язкова опція. Можете вибрати або пропустити." />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentDay.afternoonSnackOptions.map((meal) => (
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
                  onClick={() => handleMealSelection(meal, 'afternoon_snack')}
                  disabled={selectedChildObj && isChildAllergic(meal, selectedChildObj)}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : getCurrentSelections('afternoon_snack').includes(meal.name) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : getCurrentSelections('afternoon_snack').includes(meal.name)
                    ? 'Обрано'
                    : getCurrentSelections('afternoon_snack').length >= 2 && !getCurrentSelections('afternoon_snack').includes(meal.name)
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

      {/* Save Button - Bottom of interface for better UX */}
      {currentChild && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <Button 
              onClick={saveSelections}
              disabled={saving || !hasUnsavedChanges()}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Збереження...' : hasUnsavedChanges() ? 'Зберегти вибір' : 'Всі зміни збережено'}
            </Button>
            {hasUnsavedChanges() && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Не забудьте зберегти ваш вибір перед виходом
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};