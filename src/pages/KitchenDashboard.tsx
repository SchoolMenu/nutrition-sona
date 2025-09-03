import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { DailyOrders } from "@/components/Kitchen/DailyOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";

// Mock data for kitchen orders
const mockOrders = [
  {
    studentId: "1",
    studentName: "Олексій Петренко",
    grade: "7-А",
    meal1: "Борщ український з сметаною",
    meal2: "Котлета куряча з картопляним пюре",
    side: "Салат з свіжих овочів",
    allergies: ["Горіхи", "Молочні продукти"],
    specialNotes: "Без сметани в борщі"
  },
  {
    studentId: "2",
    studentName: "Марія Петренко", 
    grade: "4-Б",
    meal1: "Суп-пюре з гарбуза",
    meal2: "Рагу овочеве з рисом",
    allergies: [],
  },
  {
    studentId: "3",
    studentName: "Андрій Коваль",
    grade: "6-В",
    meal1: "Борщ український з сметаною",
    meal2: "Котлета куряча з картопляним пюре",
    side: "Салат з свіжих овочів",
    allergies: ["Яйця"],
  },
  {
    studentId: "4",
    studentName: "Софія Іванова",
    grade: "5-А",
    meal1: "Суп-пюре з гарбуза",
    meal2: "Котлета куряча з картопляним пюре",
    allergies: ["Молочні продукти"],
  },
  {
    studentId: "5",
    studentName: "Михайло Шевченко",
    grade: "8-Б",
    meal1: "Борщ український з сметаною",
    meal2: "Рагу овочеве з рисом",
    side: "Салат з свіжих овочів",
    allergies: [],
  }
];

const KitchenDashboard = () => {
  const [completedDishes, setCompletedDishes] = useState<string[]>([]);
  
  const handleMarkReady = (dishName: string) => {
    setCompletedDishes(prev => [...prev, dishName]);
    // Show toast notification
    console.log(`Страва "${dishName}" позначена як готова`);
  };

  const today = new Date().toISOString().split('T')[0];
  const totalOrders = mockOrders.length;
  const studentsWithAllergies = mockOrders.filter(order => order.allergies.length > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName="Кухар Олена"
        notificationCount={3}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-card-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Замовлень сьогодні</div>
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
                  <div className="text-2xl font-bold text-foreground">{studentsWithAllergies}</div>
                  <div className="text-sm text-muted-foreground">З алергіями</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{completedDishes.length}</div>
                  <div className="text-sm text-muted-foreground">Страв готово</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <div className="text-2xl font-bold text-foreground">12:30</div>
                  <div className="text-sm text-muted-foreground">До обіду</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Позначити всі готовими
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Замовлення на завтра
              </Button>
              <Button variant="outline">
                Друкувати список
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders */}
        <DailyOrders 
          date={today}
          orders={mockOrders}
          onMarkReady={handleMarkReady}
        />
      </main>
    </div>
  );
};

export default KitchenDashboard;