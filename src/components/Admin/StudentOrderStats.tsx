import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, XCircle, TrendingUp, Calendar, ArrowUpDown } from "lucide-react";
import { useStudentOrderStats } from "@/hooks/useStudentOrderStats";

export const StudentOrderStats = () => {
  const [selectedDate, setSelectedDate] = useState('2025-09-05'); // Date with test orders
  const [sortBy, setSortBy] = useState<'grade' | 'name'>('grade');
  const { stats, loading, error } = useStudentOrderStats(selectedDate);

  if (loading) {
    return (
      <Card className="border-card-border">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Завантаження статистики...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-card-border">
        <CardContent className="p-6">
          <div className="text-center text-destructive">Помилка: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Group students by class and then by dish
  const getClassBasedDishStats = () => {
    const classMap = new Map<string, Map<string, string[]>>();
    
    stats.dishChoiceStats.forEach(dish => {
      dish.students.forEach(student => {
        if (!classMap.has(student.grade)) {
          classMap.set(student.grade, new Map());
        }
        
        const classData = classMap.get(student.grade)!;
        if (!classData.has(dish.dishName)) {
          classData.set(dish.dishName, []);
        }
        
        classData.get(dish.dishName)!.push(student.name);
      });
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

  const classBasedStats = getClassBasedDishStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Статистика замовлень учнів</h2>
          <p className="text-muted-foreground">Скільки учнів обрали страви на обрану дату</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-picker">Дата:</Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всього учнів
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">зареєстровано в системі</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Обрали страви
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.studentsWithOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">учнів зробили замовлення</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ще не обрали
            </CardTitle>
            <XCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.studentsWithoutOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">учнів без замовлень</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Участь у замовленнях
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.orderParticipationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">від всіх учнів</p>
          </CardContent>
        </Card>
      </div>

      {/* Dish Choice Breakdown */}
      <Card className="border-card-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Розподіл по стравах на {new Date(selectedDate).toLocaleDateString('uk-UA')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: 'grade' | 'name') => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade">По класах</SelectItem>
                  <SelectItem value="name">По іменах</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {classBasedStats.length > 0 ? (
            <div className="space-y-6">
              {classBasedStats.map((classData, index) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Немає замовлень</h3>
              <p className="text-muted-foreground">На обрану дату ще немає замовлень від учнів</p>
              <p className="text-xs text-muted-foreground mt-2">
                Спробуйте обрати іншу дату. Тестові замовлення доступні на: 2025-09-04, 2025-09-05
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};