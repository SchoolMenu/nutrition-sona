import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, Check } from "lucide-react";
import { mockMenuData, type MenuItem, type DayMenu } from "@/data/menuData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMenuItems } from "@/hooks/useMenuItems";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
}

interface MenuViewProps {
  selectedChildId?: string;
}

export const MenuView = ({ selectedChildId }: MenuViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loadMenuFromDatabase } = useMenuItems();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [currentChild, setCurrentChild] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<DayMenu[]>(mockMenuData.days);
  const [weekInfo, setWeekInfo] = useState({ weekStart: mockMenuData.weekStart, weekEnd: mockMenuData.weekEnd });
  
  const currentDay = menuData[selectedDayIndex];

  useEffect(() => {
    if (user) {
      fetchChildren();
      loadMenuData();
    }
  }, [user]);

  const loadMenuData = async () => {
    // Get current week's Monday and Sunday
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    try {
      const dbMenuData = await loadMenuFromDatabase(weekStart, weekEnd);
      
      if (dbMenuData && dbMenuData.length > 0) {
        setMenuData(dbMenuData);
        setWeekInfo({
          weekStart: monday.toLocaleDateString('uk-UA'),
          weekEnd: sunday.toLocaleDateString('uk-UA')
        });
      }
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

  const loadExistingOrders = async () => {
    if (!currentChild || !currentDay) return;

    try {
      const { data, error } = await supabase
        .from('meal_orders' as any)
        .select('meal_id, meal_type')
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
        newSelectedMeals[key].push(order.meal_id);
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
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити дітей',
        variant: 'destructive'
      });
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

  const formatPrice = (price: number) => `${price} грн`;

  const handleMealSelection = async (meal: MenuItem, mealType: string) => {
    if (!currentChild) {
      toast({
        title: 'Помилка',
        description: 'Оберіть дитину',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    // Remove existing order for this day and meal type
    await supabase
      .from('meal_orders' as any)
      .delete()
      .eq('child_id', currentChild)
      .eq('meal_date', currentDay.date)
      .eq('meal_type', mealType);

    // Add new order
    const { error } = await supabase
      .from('meal_orders' as any)
      .insert({
        child_id: currentChild,
        meal_id: meal.id,
        meal_date: currentDay.date,
        meal_type: mealType
      } as any);

    if (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти замовлення',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Успіх',
        description: `Обрано: ${meal.name}`,
      });
      
      // Update local state
      setSelectedMeals(prev => ({
        ...prev,
        [`${currentDay.date}-${mealType}`]: [meal.id]
      }));
    }

    setLoading(false);
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
          <CardTitle className="text-xl">Меню на тиждень</CardTitle>
          <CardDescription>
            {weekInfo.weekStart} - {weekInfo.weekEnd}
          </CardDescription>
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
                  disabled={loading || (selectedChildObj && isChildAllergic(meal, selectedChildObj))}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : selectedMeals[`${currentDay.date}-meal1`]?.includes(meal.id) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : selectedMeals[`${currentDay.date}-meal1`]?.includes(meal.id)
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
                  disabled={loading || (selectedChildObj && isChildAllergic(meal, selectedChildObj))}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : selectedMeals[`${currentDay.date}-meal2`]?.includes(meal.id) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : selectedMeals[`${currentDay.date}-meal2`]?.includes(meal.id)
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
                Додатково
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
                  disabled={loading || (selectedChildObj && isChildAllergic(meal, selectedChildObj))}
                >
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : selectedMeals[`${currentDay.date}-side`]?.includes(meal.id) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {selectedChildObj && isChildAllergic(meal, selectedChildObj) 
                    ? 'Алергія' 
                    : selectedMeals[`${currentDay.date}-side`]?.includes(meal.id)
                    ? 'Обрано'
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