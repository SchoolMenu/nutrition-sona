import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { WelcomeCard } from "@/components/Dashboard/WelcomeCard";
import { QuickStats } from "@/components/Dashboard/QuickStats";
import { ChildrenCards } from "@/components/Dashboard/ChildrenCards";
import { MenuView } from "@/components/Dashboard/MenuView";
import { ChildProfile } from "@/components/Dashboard/ChildProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderStatistics } from "@/hooks/useOrderStatistics";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
  hasOrderForWeek: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, refetch } = useOrderStatistics();
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
      hasOrderForWeek: child.name.includes('Олексій')
    }));
    
    setChildren(childrenWithMeals);
    setLoading(false);
  };

  const handleViewChild = (childId: string) => {
    console.log("View child:", childId);
    setSelectedChildId(childId);
    setActiveTab("profile");
  };

  const handleOrderMeals = (childId: string) => {
    console.log("Order meals for child:", childId);
    setSelectedChildId(childId);
    setActiveTab("menu");
  };

  const handleStatsRefresh = () => {
    refetch();
    fetchChildren();
  };

  return (
    <div className="min-h-screen bg-background">
        <Header 
          userName="Оксана Петренко"
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
              weeklySpent={stats.weeklySpent}
              mealsThisWeek={stats.mealsThisWeek}
              upcomingMeals={stats.upcomingMeals}
              monthlySpent={stats.monthlySpent}
              monthlyBudget={stats.monthlyBudget}
              remainingBudget={stats.remainingBudget}
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
                onChildAdded={fetchChildren}
              />
            )}
          </>
        )}

        {activeTab === "menu" && (
          <MenuView selectedChildId={selectedChildId} onOrdersChange={handleStatsRefresh} />
        )}

        {activeTab === "profile" && (
          <div className="space-y-4">
            {selectedChildId ? (
              <ChildProfile 
                child={children.find(c => c.id === selectedChildId)} 
                onBack={() => setActiveTab("home")}
                onOrderMeals={() => {
                  setActiveTab("menu");
                }}
                onChildUpdated={fetchChildren}
              />
            ) : (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Профіль</h2>
                <p className="text-muted-foreground">Оберіть дитину для перегляду профілю</p>
              </div>
            )}
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