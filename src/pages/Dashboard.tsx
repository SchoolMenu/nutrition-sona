import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { WelcomeCard } from "@/components/Dashboard/WelcomeCard";
import { QuickStats } from "@/components/Dashboard/QuickStats";
import { ChildrenCards } from "@/components/Dashboard/ChildrenCards";
import { MenuView } from "@/components/Dashboard/MenuView";

// Mock data - in real app this would come from API
const mockChildren = [
  {
    id: "1",
    name: "Олексій Петренко",
    grade: "7",
    allergies: ["Горіхи", "Молочні продукти"],
    todayMeal: "Борщ з сметаною",
    hasOrderForWeek: true
  },
  {
    id: "2", 
    name: "Марія Петренко",
    grade: "4",
    allergies: [],
    todayMeal: "Котлета з картоплею",
    hasOrderForWeek: false
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleViewChild = (childId: string) => {
    console.log("View child:", childId);
    // Navigate to child profile
  };

  const handleOrderMeals = (childId: string) => {
    console.log("Order meals for child:", childId);
    // Navigate to meal ordering
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName="Оксана Петренко"
        notificationCount={2}
      />
      
      <main className="container mx-auto px-4 py-6 pb-20 space-y-6">
        {activeTab === "home" && (
          <>
            <WelcomeCard 
              parentName="Оксана"
              childrenCount={2}
              pendingOrders={5}
            />
            
            <QuickStats 
              weeklySpent={450}
              mealsThisWeek={8}
              upcomingMeals={6}
              monthlyBudget={1500}
            />
            
            <ChildrenCards 
              children={mockChildren}
              onViewChild={handleViewChild}
              onOrderMeals={handleOrderMeals}
            />
          </>
        )}

        {activeTab === "menu" && (
          <MenuView />
        )}

        {activeTab === "profile" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Профіль</h2>
            <p className="text-muted-foreground">Розділ в розробці</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Налаштування</h2>
            <p className="text-muted-foreground">Розділ в розробці</p>
          </div>
        )}
      </main>
      
      <BottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Dashboard;