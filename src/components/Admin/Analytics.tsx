import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { StudentOrderStats } from "./StudentOrderStats";
import { useMonthlyAnalytics } from "@/hooks/useMonthlyAnalytics";

export const Analytics = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  
  const { analytics: monthlyStats, loading, error } = useMonthlyAnalytics(selectedYear, selectedMonth);

  const months = [
    { value: 1, label: 'Січень' },
    { value: 2, label: 'Лютий' },
    { value: 3, label: 'Березень' },
    { value: 4, label: 'Квітень' },
    { value: 5, label: 'Травень' },
    { value: 6, label: 'Червень' },
    { value: 7, label: 'Липень' },
    { value: 8, label: 'Серпень' },
    { value: 9, label: 'Вересень' },
    { value: 10, label: 'Жовтень' },
    { value: 11, label: 'Листопад' },
    { value: 12, label: 'Грудень' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getSelectedMonthLabel = () => {
    const month = months.find(m => m.value === selectedMonth);
    return `${month?.label} ${selectedYear}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Завантаження аналітики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Помилка: {error}</div>
      </div>
    );
  }

  const exportReport = () => {
    exportToCSV();
  };

  const exportToCSV = () => {
    const csvData = [
      ['Звіт про аналітику харчування'],
      ['Період: ' + getSelectedMonthLabel()],
      ['Дата створення: ' + new Date().toLocaleDateString('uk-UA')],
      [''],
      ['ЗАГАЛЬНА СТАТИСТИКА'],
      ['Показник', 'Значення'],
      ['Загальний дохід', '₴' + monthlyStats.totalRevenue],
      ['Всього замовлень', monthlyStats.totalOrders.toString()],
      ['Активних учнів', monthlyStats.activeStudents.toString()],
      ['Середній чек', '₴' + monthlyStats.averageOrderValue],
      [''],
      ['ТИЖНЕВА СТАТИСТИКА'],
      ['Тиждень', 'Замовлень', 'Дохід'],
      ...monthlyStats.weeklyData.map(week => [
        week.week,
        week.orders.toString(),
        '₴' + week.revenue
      ]),
      [''],
      ['РОЗРАХУНКИ ПО УЧНЯМ'],
      ['Учень', 'Клас', 'Батьки', 'Замовлень', 'Сума'],
      ...monthlyStats.studentBilling.map(student => [
        student.studentName,
        student.grade,
        student.parentName,
        student.ordersCount.toString(),
        '₴' + student.totalAmount
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-report-${getSelectedMonthLabel().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const exportBilling = () => {
    const csvData = [
      ['Розрахунки по учням'],
      ['Період: ' + getSelectedMonthLabel()],
      ['Дата створення: ' + new Date().toLocaleDateString('uk-UA')],
      [''],
      ['Учень', 'Клас', 'Батьки', 'Замовлень за місяць', 'Загальна сума'],
      ...monthlyStats.studentBilling.map(student => [
        student.studentName,
        student.grade,
        student.parentName,
        student.ordersCount.toString(),
        '₴' + student.totalAmount
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `student-billing-${getSelectedMonthLabel().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Аналітика та звіти</h2>
          <p className="text-muted-foreground">Статистика продажів та замовлень за {getSelectedMonthLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Вибір періоду
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Попередній
            </Button>
            
            <div className="flex items-center gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="flex items-center gap-2"
            >
              Наступний
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-xs text-success mt-1">{getSelectedMonthLabel()}</p>
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
            <p className="text-xs text-success mt-1">{getSelectedMonthLabel()}</p>
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
            <p className="text-xs text-muted-foreground mt-1">Які робили замовлення</p>
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
            <p className="text-xs text-success mt-1">На одне замовлення</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Статистика замовлень</TabsTrigger>
          <TabsTrigger value="weekly">Тижнева динаміка</TabsTrigger>
          <TabsTrigger value="billing">Розрахунки</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <StudentOrderStats />
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
                <Button variant="outline" size="sm" onClick={exportBilling}>
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
                        {student.grade} клас
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