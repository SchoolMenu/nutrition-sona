import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, AlertTriangle, User, GraduationCap, Shield, ChefHat, ChevronLeft, ChevronRight } from "lucide-react";
import { EditChildDialog } from "./EditChildDialog";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDay, addWeeks } from "date-fns";
import { uk } from "date-fns/locale";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
  todayMeal?: string;
  hasOrderForWeek: boolean;
}

interface MealOrder {
  id: string;
  meal_date: string;
  meal_name: string;
  meal_type: string;
}

interface ChildProfileProps {
  child?: Child;
  onBack: () => void;
  onOrderMeals?: () => void;
  onChildUpdated?: () => void;
}

export const ChildProfile = ({ child, onBack, onOrderMeals, onChildUpdated }: ChildProfileProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mealOrders, setMealOrders] = useState<MealOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.

  // Get week dates based on offset
  const today = new Date();
  const baseWeek = addWeeks(today, weekOffset);
  const weekStart = startOfWeek(baseWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    if (child?.id) {
      fetchMealOrders();
    }
  }, [child?.id, weekOffset]);

  const fetchMealOrders = async () => {
    if (!child?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_orders')
        .select('*')
        .eq('child_id', child.id)
        .gte('meal_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('meal_date', format(weekEnd, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching meal orders:', error);
      } else {
        setMealOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching meal orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && weekOffset > -4) { // Allow up to 4 weeks back
      setWeekOffset(weekOffset - 1);
    } else if (direction === 'next' && weekOffset < 4) { // Allow up to 4 weeks forward
      setWeekOffset(weekOffset + 1);
    }
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) {
      return "Поточний тиждень";
    } else if (weekOffset === 1) {
      return "Наступний тиждень";
    } else if (weekOffset > 1) {
      return `Через ${weekOffset} тижнів`;
    } else if (weekOffset === -1) {
      return "Минулий тиждень";
    } else {
      return `${Math.abs(weekOffset)} тижнів назад`;
    }
  };

  // Remove getMealName function since we now store names directly

  // Group orders by date
  const getOrdersForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealOrders.filter(order => order.meal_date === dateStr);
  };

  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];

  if (!child) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Дитину не знайдено</h2>
        <Button onClick={onBack}>Повернутися назад</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Профіль дитини</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={""} alt={child.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{child.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <GraduationCap className="h-4 w-4" />
                <span>{child.grade} клас</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Алергії та обмеження
            </CardTitle>
          </CardHeader>
          <CardContent>
            {child.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {child.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Алергій не виявлено</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Замовлення на тиждень
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('prev')}
                  disabled={weekOffset <= -4}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  {getWeekLabel()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('next')}
                  disabled={weekOffset >= 4}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(weekStart, 'dd.MM', { locale: uk })} - {format(weekEnd, 'dd.MM', { locale: uk })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Статус замовлення:</span>
                <Badge variant={mealOrders.length > 0 ? "default" : "secondary"}>
                  {mealOrders.length > 0 ? "Активне" : "Немає замовлень"}
                </Badge>
              </div>
              
              {loading ? (
                <p className="text-sm text-muted-foreground">Завантаження замовлень...</p>
              ) : (
                <div className="space-y-3">
                  {weekDays.slice(0, 5).map((day) => { // Only weekdays
                    const dayOrders = getOrdersForDay(day);
                    const dayIndex = getDay(day) === 0 ? 6 : getDay(day) - 1; // Adjust for Monday start
                    
                    return (
                      <div key={format(day, 'yyyy-MM-dd')} className="border rounded-lg p-3 bg-card/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {dayNames[dayIndex]} ({format(day, 'dd.MM', { locale: uk })})
                          </h4>
                          {dayOrders.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {dayOrders.length} страв
                            </Badge>
                          )}
                        </div>
                        
                        {dayOrders.length > 0 ? (
                          <div className="space-y-1">
                            {dayOrders.map((order) => (
                              <div key={order.id} className="flex items-center gap-2 text-sm">
                                <ChefHat className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground capitalize">{order.meal_type}:</span>
                                <span>{order.meal_name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Замовлень немає</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Дії
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={onOrderMeals}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Замовити обіди
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              Редагувати профіль
            </Button>
          </div>
        </CardContent>
      </Card>

      {onChildUpdated && (
        <EditChildDialog
          child={child}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onChildUpdated={onChildUpdated}
        />
      )}
    </div>
  );
};