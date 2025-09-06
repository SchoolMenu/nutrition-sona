import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Utensils, CreditCard } from "lucide-react";

interface QuickStatsProps {
  weeklySpent: number;
  mealsThisWeek: number;
  upcomingMeals: number;
  monthlySpent: number;
}

export const QuickStats = ({ 
  weeklySpent, 
  mealsThisWeek, 
  monthlySpent
}: QuickStatsProps) => {
  const stats = [
    {
      title: "Цього тижня",
      value: `₴${weeklySpent}`,
      icon: CreditCard
    },
    {
      title: "Страв замовлено",
      value: mealsThisWeek.toString(),
      icon: Utensils
    },
    
    {
      title: "Витрачено за місяць",
      value: `₴${monthlySpent}`,
      icon: TrendingUp
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};