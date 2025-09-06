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
  meal1: string;
  meal2: string;
  side?: string;
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
          // Extract numeric part of grade for proper sorting
          const gradeA = parseInt(a.grade) || 0;
          const gradeB = parseInt(b.grade) || 0;
          return gradeA - gradeB;
        });
        break;
      case 'name':
        sortedOrders.sort((a, b) => a.studentName.localeCompare(b.studentName, 'uk'));
        break;
      default:
        // Keep original order
        break;
    }
    
    return sortedOrders;
  };

  // Group orders by dish
  const getDishSummary = (): DishSummary[] => {
    const sortedOrders = getSortedOrders();
    const dishMap = new Map<string, string[]>();
    
    sortedOrders.forEach(order => {
      // Add meal1
      if (!dishMap.has(order.meal1)) {
        dishMap.set(order.meal1, []);
      }
      dishMap.get(order.meal1)!.push(`${order.studentName} (${order.grade} кл.)`);
      
      // Add meal2
      if (!dishMap.has(order.meal2)) {
        dishMap.set(order.meal2, []);
      }
      dishMap.get(order.meal2)!.push(`${order.studentName} (${order.grade} кл.)`);
      
      // Add side if exists
      if (order.side) {
        if (!dishMap.has(order.side)) {
          dishMap.set(order.side, []);
        }
        dishMap.get(order.side)!.push(`${order.studentName} (${order.grade} кл.)`);
      }
    });
    
    return Array.from(dishMap.entries()).map(([dishName, students]) => ({
      dishName,
      count: students.length,
      students
    }));
  };

  const sortedOrders = getSortedOrders();
  const dishSummaries = getDishSummary();
  const totalStudents = orders.length;
  const studentsWithAllergies = orders.filter(order => order.allergies.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Замовлення на сьогодні</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(date).toLocaleDateString('uk-UA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalStudents}</div>
            <div className="text-sm text-muted-foreground">учнів</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="text-xl font-bold text-foreground">{dishSummaries.length}</div>
                <div className="text-sm text-muted-foreground">Різних страв</div>
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
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Страви до приготування
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dishSummaries.map((dish, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{dish.dishName}</h4>
                <p className="text-sm text-muted-foreground">
                  Порцій: <span className="font-medium text-foreground">{dish.count}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {dish.students.slice(0, 3).map((student, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {student}
                    </Badge>
                  ))}
                  {dish.students.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dish.students.length - 3} ще
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                      {order.meal1} + {order.meal2}
                      {order.side && ` + ${order.side}`}
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