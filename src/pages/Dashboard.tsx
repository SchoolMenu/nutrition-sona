import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { WelcomeCard } from "@/components/Dashboard/WelcomeCard";
import { QuickStats } from "@/components/Dashboard/QuickStats";
import { ChildrenCards } from "@/components/Dashboard/ChildrenCards";
import { MenuView } from "@/components/Dashboard/MenuView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
  todayMeal?: string;
  hasOrderForWeek: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id);
    
    if (error) {
      console.error('Error fetching children:', error);
      setLoading(false);
      return;
    }
    
    // Add mock meal info for display
    const childrenWithMeals = (data || []).map((child: any) => ({
      ...child,
      todayMeal: child.name.includes('Олексій') ? "Борщ з сметаною" : "Котлета з картоплею",
      hasOrderForWeek: child.name.includes('Олексій')
    }));
    
    setChildren(childrenWithMeals);
    setLoading(false);
  };

  const handleViewChild = (childId: string) => {
    console.log("View child:", childId);
    // Navigate to child profile
  };

  const handleOrderMeals = (childId: string) => {
    console.log("Order meals for child:", childId);
    setSelectedChildId(childId);
    setActiveTab("menu");
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
              parentName="Каріна"
              childrenCount={children.length}
              pendingOrders={5}
            />
            
            <QuickStats 
              weeklySpent={450}
              mealsThisWeek={8}
              upcomingMeals={6}
              monthlyBudget={1500}
            />
            
            {loading ? (
              <div className="text-center py-8">
                <p>Завантаження дітей...</p>
              </div>
            ) : (
              <ChildrenCards 
                children={children}
                onViewChild={handleViewChild}
                onOrderMeals={handleOrderMeals}
              />
            )}
          </>
        )}

        {activeTab === "menu" && (
          <MenuView selectedChildId={selectedChildId} />
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