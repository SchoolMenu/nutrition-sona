import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { MenuManager } from "@/components/Admin/MenuManager";
import { Analytics } from "@/components/Admin/Analytics";
import { WeeklyOrders } from "@/components/Admin/WeeklyOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMenuData, DayMenu } from "@/data/menuData";
import { useMenuItems } from "@/hooks/useMenuItems";


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
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-1">
            <TabsTrigger value="menu" className="text-xs md:text-sm">Меню</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">Замовлення</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">Звіти</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-6">
            <MenuManager 
              weekMenu={weekMenu}
              onUpdateMenu={handleUpdateMenu}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <WeeklyOrders />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;