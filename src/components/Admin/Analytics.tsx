import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar } from "lucide-react";
import { StudentOrderStats } from "./StudentOrderStats";

interface MonthlyStats {
  totalRevenue: number;
  totalOrders: number;
  activeStudents: number;
  averageOrderValue: number;
  topDishes: { name: string; orders: number; revenue: number }[];
  weeklyData: { week: string; revenue: number; orders: number }[];
  studentBilling: { 
    studentName: string; 
    grade: string; 
    ordersCount: number; 
    totalAmount: number;
    parentName: string;
  }[];
}

interface AnalyticsProps {
  monthlyStats: MonthlyStats;
}

export const Analytics = ({ monthlyStats }: AnalyticsProps) => {
  const exportReport = (type: 'csv' | 'pdf') => {
    console.log(`Exporting ${type} report...`);
    // Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Аналітика та звіти</h2>
          <p className="text-muted-foreground">Статистика продажів та замовлень</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Загальний дохід
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₴{monthlyStats.totalRevenue}</div>
            <p className="text-xs text-success mt-1">+15% від минулого місяця</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всього замовлень
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{monthlyStats.totalOrders}</div>
            <p className="text-xs text-success mt-1">+8% від минулого місяця</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активних учнів
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{monthlyStats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">З {monthlyStats.activeStudents + 23} зареєстрованих</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Середній чек
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₴{monthlyStats.averageOrderValue}</div>
            <p className="text-xs text-success mt-1">+3% від минулого місяця</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Статистика замовлень</TabsTrigger>
          <TabsTrigger value="dishes">Популярні страви</TabsTrigger>
          <TabsTrigger value="weekly">Тижнева динаміка</TabsTrigger>
          <TabsTrigger value="billing">Розрахунки</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <StudentOrderStats />
        </TabsContent>

        <TabsContent value="dishes" className="mt-6">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Топ-10 популярних страв</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.topDishes.map((dish, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-card-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium text-foreground">{dish.name}</h4>
                        <p className="text-sm text-muted-foreground">{dish.orders} замовлень</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">₴{dish.revenue}</div>
                      <div className="text-sm text-muted-foreground">дохід</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Тижнева статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{week.week}</h4>
                        <p className="text-sm text-muted-foreground">{week.orders} замовлень</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">₴{week.revenue}</div>
                      <div className="text-sm text-muted-foreground">дохід</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="border-card-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Розрахунки по учням</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Експорт рахунків
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyStats.studentBilling.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">{student.studentName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.grade} клас • Батько: {student.parentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.ordersCount} замовлень цього місяця
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">₴{student.totalAmount}</div>
                      <Button variant="outline" size="sm" className="mt-1">
                        Деталі
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};