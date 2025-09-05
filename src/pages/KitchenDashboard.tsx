import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { DailyOrders } from "@/components/Kitchen/DailyOrders";
import { WeeklyOrders } from "@/components/Admin/WeeklyOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users } from "lucide-react";
import { useMealOrders } from "@/hooks/useMealOrders";

const KitchenDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const { orders, loading, error } = useMealOrders(selectedDate);

  const handlePrintList = () => {
    const totalOrders = orders.length;
    const studentsWithAllergies = orders.filter(order => order.allergies.length > 0).length;
    
    // Create a printable version of the orders
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Список замовлень - ${new Date(selectedDate).toLocaleDateString('uk-UA')}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .stats {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f5f5f5;
            }
            .dishes-section, .allergies-section {
              margin-bottom: 30px;
            }
            .dish-item {
              margin-bottom: 15px;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .dish-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .dish-count {
              color: #666;
              margin-bottom: 8px;
            }
            .students-list {
              font-size: 14px;
            }
            .allergy-item {
              margin-bottom: 10px;
              padding: 8px;
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 5px;
            }
            .student-name {
              font-weight: bold;
            }
            .allergies {
              color: #dc3545;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Список замовлень на ${new Date(selectedDate).toLocaleDateString('uk-UA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h1>
          </div>
          
          <div class="stats">
            <div><strong>Загально учнів:</strong> ${totalOrders}</div>
            <div><strong>Учнів з алергіями:</strong> ${studentsWithAllergies}</div>
            <div><strong>Час друку:</strong> ${new Date().toLocaleString('uk-UA')}</div>
          </div>

          ${orders.length === 0 ? 
            '<p style="text-align: center; font-size: 18px; margin: 50px 0;">Немає замовлень на цю дату</p>' :
            `
            <div class="dishes-section">
              <h2>Страви до приготування</h2>
              ${(() => {
                // Group orders by dish
                const dishMap = new Map();
                orders.forEach(order => {
                  // Add meal1
                  if (!dishMap.has(order.meal1)) {
                    dishMap.set(order.meal1, []);
                  }
                  dishMap.get(order.meal1).push(`${order.studentName} (${order.grade} кл.)`);
                  
                  // Add meal2
                  if (!dishMap.has(order.meal2)) {
                    dishMap.set(order.meal2, []);
                  }
                  dishMap.get(order.meal2).push(`${order.studentName} (${order.grade} кл.)`);
                  
                  // Add side if exists
                  if (order.side) {
                    if (!dishMap.has(order.side)) {
                      dishMap.set(order.side, []);
                    }
                    dishMap.get(order.side).push(`${order.studentName} (${order.grade} кл.)`);
                  }
                });
                
                return Array.from(dishMap.entries()).map(([dishName, students]) => `
                  <div class="dish-item">
                    <div class="dish-name">${dishName}</div>
                    <div class="dish-count">Порцій: ${students.length}</div>
                    <div class="students-list">${students.join(', ')}</div>
                  </div>
                `).join('');
              })()}
            </div>

            ${orders.filter(order => order.allergies.length > 0).length > 0 ? `
            <div class="allergies-section">
              <h2 style="color: #dc3545;">⚠️ УВАГА: Учні з алергіями</h2>
              ${orders.filter(order => order.allergies.length > 0).map(order => `
                <div class="allergy-item">
                  <div class="student-name">${order.studentName} (${order.grade} клас)</div>
                  <div>Замовлення: ${order.meal1} + ${order.meal2}${order.side ? ` + ${order.side}` : ''}</div>
                  <div class="allergies">Алергії: ${order.allergies.join(', ')}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            `
          }
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait a bit for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

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
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Сьогоднішні замовлення</TabsTrigger>
            <TabsTrigger value="week">Замовлення на тиждень</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-6 space-y-6">
            {/* Quick Stats */}
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
                  <Button variant="outline" onClick={handlePrintList}>
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
          </TabsContent>

          <TabsContent value="week" className="mt-6">
            <WeeklyOrders />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default KitchenDashboard;