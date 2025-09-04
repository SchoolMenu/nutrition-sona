import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { MenuManager } from "@/components/Admin/MenuManager";
import { Analytics } from "@/components/Admin/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Calendar } from "lucide-react";
import { mockMenuData, DayMenu } from "@/data/menuData";
import { useMenuItems } from "@/hooks/useMenuItems";

// Mock analytics data
const mockAnalytics = {
  totalRevenue: 25680,
  totalOrders: 1247,
  activeStudents: 156,
  averageOrderValue: 68,
  topDishes: [
    { name: "Борщ український з сметаною", orders: 89, revenue: 4005 },
    { name: "Котлета куряча з картоплею", orders: 76, revenue: 4180 },
    { name: "Суп курячий з локшиною", orders: 65, revenue: 2925 },
    { name: "Рагу овочеве з рисом", orders: 58, revenue: 2900 },
    { name: "Голубці з м'ясом", orders: 45, revenue: 2700 },
    { name: "Каша гречана з грибами", orders: 42, revenue: 1890 },
    { name: "Вареники з картоплею", orders: 38, revenue: 1900 },
    { name: "Рибні котлети з овочами", orders: 35, revenue: 2275 },
    { name: "Солянка м'ясна", orders: 32, revenue: 1600 },
    { name: "Печеня яловича", orders: 28, revenue: 1960 }
  ],
  weeklyData: [
    { week: "Тиждень 1 (1-5 січня)", revenue: 6420, orders: 312 },
    { week: "Тиждень 2 (8-12 січня)", revenue: 6890, orders: 335 },
    { week: "Тиждень 3 (15-19 січня)", revenue: 6180, orders: 298 },
    { week: "Тиждень 4 (22-26 січня)", revenue: 6190, orders: 302 }
  ],
  studentBilling: [
    { studentName: "Олексій Петренко", grade: "7-А", ordersCount: 18, totalAmount: 1240, parentName: "Оксана Петренко" },
    { studentName: "Марія Петренко", grade: "4-Б", ordersCount: 16, totalAmount: 980, parentName: "Оксана Петренко" },
    { studentName: "Андрій Коваль", grade: "6-В", ordersCount: 19, totalAmount: 1350, parentName: "Ігор Коваль" },
    { studentName: "Софія Іванова", grade: "5-А", ordersCount: 17, totalAmount: 1120, parentName: "Тетяна Іванова" },
    { studentName: "Михайло Шевченко", grade: "8-Б", ordersCount: 20, totalAmount: 1450, parentName: "Володимир Шевченко" },
    { studentName: "Анна Мельник", grade: "3-А", ordersCount: 15, totalAmount: 890, parentName: "Людмила Мельник" },
    { studentName: "Дмитро Бойko", grade: "9-В", ordersCount: 18, totalAmount: 1280, parentName: "Сергій Бойко" },
    { studentName: "Катерина Литвин", grade: "6-А", ordersCount: 16, totalAmount: 1050, parentName: "Олена Литвин" }
  ]
};

const AdminDashboard = () => {
  const [weekMenu, setWeekMenu] = useState<DayMenu[]>(mockMenuData.days);
  const { loading, loadMenuFromDatabase } = useMenuItems();
  
  useEffect(() => {
    const loadMenu = async () => {
      // Calculate current week dates
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Friday
      
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      const dbMenu = await loadMenuFromDatabase(weekStartStr, weekEndStr);
      
      if (dbMenu && dbMenu.length > 0) {
        setWeekMenu(dbMenu);
      }
      // If no database data, keep using mock data (already set in useState)
    };
    
    loadMenu();
  }, []); // Empty dependency array to run only once on mount
  
  const handleUpdateMenu = (dayIndex: number, updatedDay: DayMenu) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex] = updatedDay;
    setWeekMenu(newWeekMenu);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName="Адмін Ірина"
        notificationCount={5}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Дохід цього місяця
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₴{mockAnalytics.totalRevenue}</div>
              <p className="text-xs text-success mt-1">+15% від минулого місяця</p>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Замовлень
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{mockAnalytics.totalOrders}</div>
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
              <div className="text-2xl font-bold text-foreground">{mockAnalytics.activeStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">З 179 зареєстрованих</p>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Середній чек
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₴{mockAnalytics.averageOrderValue}</div>
              <p className="text-xs text-success mt-1">+3% від минулого місяця</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Управління меню</TabsTrigger>
            <TabsTrigger value="analytics">Аналітика та звіти</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-6">
            <MenuManager 
              weekMenu={weekMenu}
              onUpdateMenu={handleUpdateMenu}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Analytics monthlyStats={mockAnalytics} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;