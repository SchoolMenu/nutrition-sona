import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, ChevronRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";

interface DayOrdersInfo {
  date: string;
  dayName: string;
  formattedDate: string;
  totalOrders: number;
  studentsWithAllergies: number;
  orders: any[];
}

interface OrderDetails {
  id: string;
  child_id: string;
  child_name: string;
  child_grade: string;
  child_allergies: string[];
  meal_name: string;
  meal_type: string;
  meal_date: string;
}

export const WeeklyOrders = () => {
  const [weeklyData, setWeeklyData] = useState<DayOrdersInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOrdersInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeeklyOrders();
  }, []);

  const loadWeeklyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const weekData: DayOrdersInfo[] = [];
      
      // Get next 7 days starting from today
      for (let i = 0; i < 7; i++) {
        const date = addDays(new Date(), i);
        const dateString = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEEE', { locale: uk });
        const formattedDate = format(date, 'd MMMM', { locale: uk });
        
        // Fetch orders for this day using the database function
        const { data: orders, error: ordersError } = await supabase
          .rpc('get_meal_orders_for_date', { target_date: dateString });

        if (ordersError) {
          console.error('Error fetching orders for', dateString, ':', ordersError);
          continue;
        }

        // Group orders by child to get complete meal info
        const childOrders = new Map();
        
        if (orders) {
          orders.forEach((order: OrderDetails) => {
            const childKey = order.child_id;
            if (!childOrders.has(childKey)) {
              childOrders.set(childKey, {
                child_name: order.child_name,
                child_grade: order.child_grade,
                child_allergies: order.child_allergies || [],
                meals: {}
              });
            }
            
            const child = childOrders.get(childKey);
            child.meals[order.meal_type] = order.meal_name;
          });
        }

        const processedOrders = Array.from(childOrders.values());
        const studentsWithAllergies = processedOrders.filter(
          order => order.child_allergies && order.child_allergies.length > 0
        ).length;

        weekData.push({
          date: dateString,
          dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          formattedDate,
          totalOrders: processedOrders.length,
          studentsWithAllergies,
          orders: processedOrders
        });
      }
      
      setWeeklyData(weekData);
      
      // Auto-select first day with orders
      const firstDayWithOrders = weekData.find(day => day.totalOrders > 0);
      if (firstDayWithOrders) {
        setSelectedDay(firstDayWithOrders);
      } else if (weekData.length > 0) {
        setSelectedDay(weekData[0]);
      }
      
    } catch (err) {
      console.error('Error loading weekly orders:', err);
      setError('Помилка завантаження замовлень');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDay = (day: DayOrdersInfo) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Group meals by dish name for easier cooking
    const dishMap = new Map();
    day.orders.forEach(order => {
      Object.entries(order.meals).forEach(([mealType, mealName]) => {
        if (mealName) {
          if (!dishMap.has(mealName)) {
            dishMap.set(mealName, []);
          }
          dishMap.get(mealName).push(`${order.child_name} (${order.child_grade} кл.)`);
        }
      });
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Замовлення - ${day.dayName}, ${day.formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .stats { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; }
            .dish-item { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .dish-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .dish-count { color: #666; margin-bottom: 8px; }
            .students-list { font-size: 14px; }
            .allergy-item { margin-bottom: 10px; padding: 8px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; }
            .student-name { font-weight: bold; }
            .allergies { color: #dc3545; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Замовлення на ${day.dayName}, ${day.formattedDate}</h1>
          </div>
          
          <div class="stats">
            <div><strong>Загально учнів:</strong> ${day.totalOrders}</div>
            <div><strong>Учнів з алергіями:</strong> ${day.studentsWithAllergies}</div>
            <div><strong>Час друку:</strong> ${new Date().toLocaleString('uk-UA')}</div>
          </div>

          ${day.totalOrders === 0 ? 
            '<p style="text-align: center; font-size: 18px; margin: 50px 0;">Немає замовлень на цю дату</p>' :
            `
            <div class="dishes-section">
              <h2>Страви до приготування</h2>
              ${Array.from(dishMap.entries()).map(([dishName, students]) => `
                <div class="dish-item">
                  <div class="dish-name">${dishName}</div>
                  <div class="dish-count">Порцій: ${students.length}</div>
                  <div class="students-list">${students.join(', ')}</div>
                </div>
              `).join('')}
            </div>

            ${day.studentsWithAllergies > 0 ? `
            <div class="allergies-section">
              <h2 style="color: #dc3545;">⚠️ УВАГА: Учні з алергіями</h2>
              ${day.orders.filter(order => order.child_allergies.length > 0).map(order => `
                <div class="allergy-item">
                  <div class="student-name">${order.child_name} (${order.child_grade} клас)</div>
                  <div>Замовлення: ${Object.values(order.meals).filter(Boolean).join(' + ')}</div>
                  <div class="allergies">Алергії: ${order.child_allergies.join(', ')}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            `
          }
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Завантаження замовлень на тиждень...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadWeeklyOrders} className="mt-4">
            Спробувати знову
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Замовлення на наступні 7 днів
          </CardTitle>
          <CardDescription>
            Перегляд та планування замовлень на тиждень вперед
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weeklyData.map((day) => (
              <Card 
                key={day.date} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDay?.date === day.date ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDay(day)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{day.dayName}</h3>
                      <p className="text-sm text-muted-foreground">{day.formattedDate}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {day.totalOrders} замовлень
                      </span>
                    </div>
                    
                    {day.studentsWithAllergies > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {day.studentsWithAllergies} з алергіями
                      </Badge>
                    )}
                    
                    {day.totalOrders === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Немає замовлень
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Деталі замовлень: {selectedDay.dayName}, {selectedDay.formattedDate}
                </CardTitle>
                <CardDescription>
                  {selectedDay.totalOrders} замовлень всього
                  {selectedDay.studentsWithAllergies > 0 && 
                    `, ${selectedDay.studentsWithAllergies} учнів з алергіями`
                  }
                </CardDescription>
              </div>
              <Button 
                onClick={() => handlePrintDay(selectedDay)}
                variant="outline"
                disabled={selectedDay.totalOrders === 0}
              >
                Друкувати список
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDay.totalOrders === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Поки що немає замовлень на цю дату
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Orders by dish */}
                <div>
                  <h3 className="font-semibold mb-3">Страви для приготування</h3>
                  <div className="grid gap-3">
                    {(() => {
                      const dishMap = new Map();
                      selectedDay.orders.forEach(order => {
                        Object.entries(order.meals).forEach(([mealType, mealName]) => {
                          if (mealName) {
                            if (!dishMap.has(mealName)) {
                              dishMap.set(mealName, []);
                            }
                            dishMap.get(mealName).push(order);
                          }
                        });
                      });

                      return Array.from(dishMap.entries()).map(([dishName, students]) => (
                        <Card key={dishName} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{dishName}</h4>
                              <Badge variant="secondary">
                                {students.length} порцій
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {students.map(s => `${s.child_name} (${s.child_grade} кл.)`).join(', ')}
                            </p>
                          </CardContent>
                        </Card>
                      ));
                    })()}
                  </div>
                </div>

                {/* Students with allergies */}
                {selectedDay.studentsWithAllergies > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-destructive">
                      ⚠️ Учні з алергіями
                    </h3>
                    <div className="grid gap-3">
                      {selectedDay.orders
                        .filter(order => order.child_allergies.length > 0)
                        .map(order => (
                          <Card key={order.child_name} className="border-l-4 border-l-destructive">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  {order.child_name} ({order.child_grade} клас)
                                </h4>
                                <Badge variant="destructive">
                                  Алергії
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">
                                Замовлення: {Object.values(order.meals).filter(Boolean).join(' + ')}
                              </p>
                              <p className="text-sm text-destructive font-medium">
                                Алергії: {order.child_allergies.join(', ')}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};