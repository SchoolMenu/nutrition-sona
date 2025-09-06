import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, ChefHat, CheckCircle, ArrowUpDown } from "lucide-react";

interface StudentOrder {
  studentId: string;
  studentName: string;
  grade: string;
  mainMeal: string;
  fruitBreak?: string;
  afternoonSnack?: string;
  allergies: string[];
  specialNotes?: string;
}

interface DishSummary {
  dishName: string;
  count: number;
  students: string[];
}

interface DailyOrdersProps {
  date: string;
  orders: StudentOrder[];
}

export const DailyOrders = ({ date, orders }: DailyOrdersProps) => {
  const [sortBy, setSortBy] = useState<'grade' | 'name' | 'none'>('grade');

  // Sort orders based on selected criteria
  const getSortedOrders = () => {
    let sortedOrders = [...orders];
    
    switch (sortBy) {
      case 'grade':
        sortedOrders.sort((a, b) => {
          const gradeA = parseInt(a.grade) || 0;
          const gradeB = parseInt(b.grade) || 0;
          return gradeA - gradeB;
        });
        break;
      case 'name':
        sortedOrders.sort((a, b) => a.studentName.localeCompare(b.studentName, 'uk'));
        break;
      default:
        break;
    }
    
    return sortedOrders;
  };

  // Group orders by class and then by dish
  const getClassBasedOrders = () => {
    const classMap = new Map<string, Map<string, string[]>>();
    
    sortedOrders.forEach(order => {
      if (!classMap.has(order.grade)) {
        classMap.set(order.grade, new Map());
      }
      
      const classData = classMap.get(order.grade)!;
      
      // Add main meal
      if (!classData.has(order.mainMeal)) {
        classData.set(order.mainMeal, []);
      }
      classData.get(order.mainMeal)!.push(order.studentName);
      
      // Add fruit break if exists
      if (order.fruitBreak) {
        if (!classData.has(order.fruitBreak)) {
          classData.set(order.fruitBreak, []);
        }
        classData.get(order.fruitBreak)!.push(order.studentName);
      }
      
      // Add afternoon snack if exists
      if (order.afternoonSnack) {
        if (!classData.has(order.afternoonSnack)) {
          classData.set(order.afternoonSnack, []);
        }
        classData.get(order.afternoonSnack)!.push(order.studentName);
      }
    });
    
    // Sort classes numerically
    return Array.from(classMap.entries())
      .sort(([gradeA], [gradeB]) => {
        const numA = parseInt(gradeA) || 0;
        const numB = parseInt(gradeB) || 0;
        return numA - numB;
      })
      .map(([grade, dishes]) => ({
        grade,
        dishes: Array.from(dishes.entries()).map(([dishName, students]) => ({
          dishName,
          count: students.length,
          students: sortBy === 'name' ? students.sort((a, b) => a.localeCompare(b, 'uk')) : students
        }))
      }));
  };

  const sortedOrders = getSortedOrders();
  const classBasedOrders = getClassBasedOrders();
  const totalStudents = orders.length;
  const studentsWithAllergies = orders.filter(order => order.allergies.length > 0).length;
  const totalDishes = classBasedOrders.reduce((acc, classData) => acc + classData.dishes.length, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Замовлення на сьогодні</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(date).toLocaleDateString('uk-UA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-primary">{totalStudents}</div>
          <div className="text-sm text-muted-foreground">учнів</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">{totalStudents}</div>
                <div className="text-sm text-muted-foreground">Загально учнів</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-warning" />
              <div>
                <div className="text-xl font-bold text-foreground">{totalDishes}</div>
                <div className="text-sm text-muted-foreground">Типів страв</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-destructive/10 rounded-full flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{studentsWithAllergies}</div>
                <div className="text-sm text-muted-foreground">З алергіями</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dishes to Prepare */}
      <Card className="border-card-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Страви до приготування
            </CardTitle>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: 'grade' | 'name' | 'none') => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade">По класах</SelectItem>
                  <SelectItem value="name">По іменах</SelectItem>
                  <SelectItem value="none">Без сортування</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {classBasedOrders.length > 0 ? (
            classBasedOrders.map((classData, index) => (
              <div key={index} className="border border-card-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {classData.grade} клас:
                </h3>
                <div className="space-y-2">
                  {classData.dishes.map((dish, dishIndex) => (
                    <div key={dishIndex} className="text-sm">
                      <span className="font-medium text-foreground">
                        {dish.count} порцій {dish.dishName}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({dish.students.join(', ')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Немає замовлень</h3>
              <p className="text-muted-foreground">На сьогодні ще немає замовлень від учнів</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students with Allergies */}
      {studentsWithAllergies > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <div className="h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground text-xs font-bold">!</span>
              </div>
              Увага: Учні з алергіями
            </CardTitle>
          </CardHeader>
           <CardContent>
            <div className="grid gap-3">
              {sortedOrders.filter(order => order.allergies.length > 0).map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-card-border">
                  <div>
                    <div className="font-medium text-foreground">
                      {order.studentName} ({order.grade} клас)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.mainMeal}
                      {order.fruitBreak && ` + ${order.fruitBreak}`}
                      {order.afternoonSnack && ` + ${order.afternoonSnack}`}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {order.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};