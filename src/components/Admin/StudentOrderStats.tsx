import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react";
import { useStudentOrderStats } from "@/hooks/useStudentOrderStats";

export const StudentOrderStats = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Розподіл по стравах на {new Date(selectedDate).toLocaleDateString('uk-UA')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dishChoiceStats.length > 0 ? (
            <div className="space-y-4">
              {stats.dishChoiceStats.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{dish.dishName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Обрали: <span className="font-medium text-foreground">{dish.studentCount} учн.</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dish.students.slice(0, 5).map((student, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {student.name} ({student.grade})
                        </Badge>
                      ))}
                      {dish.students.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{dish.students.length - 5} ще
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-primary">{dish.studentCount}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Немає замовлень</h3>
              <p className="text-muted-foreground">На обрану дату ще немає замовлень від учнів</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};