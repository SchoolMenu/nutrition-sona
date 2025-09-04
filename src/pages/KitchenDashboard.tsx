import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { DailyOrders } from "@/components/Kitchen/DailyOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { useMealOrders } from "@/hooks/useMealOrders";

// Mock data for kitchen orders - removed since we now use real data

const KitchenDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const { orders, loading, error } = useMealOrders(selectedDate);

  const handleShowTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleShowToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const totalOrders = orders.length;
  const studentsWithAllergies = orders.filter(order => order.allergies.length > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName="Кухар Олена"
        notificationCount={3}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button variant="default" onClick={handleShowToday}>
                <Calendar className="h-4 w-4 mr-2" />
                Сьогодні
              </Button>
              <Button variant="outline" onClick={handleShowTomorrow}>
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
        {loading ? (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Завантаження замовлень...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">Помилка: {error}</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Немає замовлень на {selectedDate === new Date().toISOString().split('T')[0] ? 'сьогодні' : 'цю дату'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DailyOrders 
            date={selectedDate}
            orders={orders}
          />
        )}
      </main>
    </div>
  );
};

export default KitchenDashboard;