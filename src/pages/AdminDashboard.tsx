import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { MenuManager } from "@/components/Admin/MenuManager";
import { Analytics } from "@/components/Admin/Analytics";
import { WeeklyOrders } from "@/components/Admin/WeeklyOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { mockMenuData, DayMenu } from "@/data/menuData";
import { useMenuItems } from "@/hooks/useMenuItems";

// Helper function to get week dates
const getWeekDates = (weekOffset: number = 0) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // Friday
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    startDate: weekStart,
    endDate: weekEnd
  };
};

const AdminDashboard = () => {
  const [weekMenu, setWeekMenu] = useState<DayMenu[]>(mockMenuData.days);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const {
    loading,
    loadMenuFromDatabase
  } = useMenuItems();

  useEffect(() => {
    const loadMenu = async () => {
      const { start, end } = getWeekDates(selectedWeekOffset);
      const dbMenu = await loadMenuFromDatabase(start, end);
      
      if (dbMenu && dbMenu.length > 0) {
        setWeekMenu(dbMenu);
      } else {
        // Generate empty menu structure for the selected week
        const { startDate } = getWeekDates(selectedWeekOffset);
        const emptyWeekMenu: DayMenu[] = [];
        
        for (let i = 0; i < 5; i++) {
          const currentDay = new Date(startDate);
          currentDay.setDate(startDate.getDate() + i);
          
          const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця"];
          
          emptyWeekMenu.push({
            date: currentDay.toISOString().split('T')[0],
            dayName: dayNames[i],
            meal1Options: [],
            meal2Options: [],
            sideOptions: []
          });
        }
        
        setWeekMenu(emptyWeekMenu);
      }
    };

    loadMenu();
  }, [selectedWeekOffset, loadMenuFromDatabase]);

  const handleWeekChange = (offset: number) => {
    setSelectedWeekOffset(offset);
  };

  const getCurrentWeekLabel = () => {
    const { startDate, endDate } = getWeekDates(selectedWeekOffset);
    const startStr = startDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    
    if (selectedWeekOffset === 0) {
      return `Поточний тиждень (${startStr} - ${endStr})`;
    } else if (selectedWeekOffset === 1) {
      return `Наступний тиждень (${startStr} - ${endStr})`;
    } else if (selectedWeekOffset > 1) {
      return `Через ${selectedWeekOffset} тижнів (${startStr} - ${endStr})`;
    } else {
      return `${Math.abs(selectedWeekOffset)} тижнів тому (${startStr} - ${endStr})`;
    }
  };

  const handleUpdateMenu = (dayIndex: number, updatedDay: DayMenu) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex] = updatedDay;
    setWeekMenu(newWeekMenu);
  };

  return <div className="min-h-screen bg-background">
      <Header userName="Адмін Ірина" />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Week Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Вибір тижня для редагування
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button
                variant="outline" 
                onClick={() => handleWeekChange(selectedWeekOffset - 1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Попередній тиждень
              </Button>
              
              <div className="text-center">
                <p className="font-medium text-lg">{getCurrentWeekLabel()}</p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleWeekChange(selectedWeekOffset + 1)}
                className="flex items-center gap-2"
              >
                Наступний тиждень
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="menu" className="text-xs md:text-sm py-[1px]">Меню</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm mx-0 py-[1px]">Замовлення</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm py-[1px]">Звіти</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-8 space-y-6">
            <MenuManager 
              weekMenu={weekMenu} 
              onUpdateMenu={handleUpdateMenu}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-8 space-y-6">
            <WeeklyOrders />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-8 space-y-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};

export default AdminDashboard;