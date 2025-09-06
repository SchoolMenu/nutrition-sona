import { Home, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: "home", label: "Головна", icon: Home, description: "Огляд та статистика" },
    { id: "menu", label: "Замовлення", icon: Calendar, description: "Меню та замовлення обідів" },
    { id: "profile", label: "Діти", icon: User, description: "Профілі дітей" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-card-border">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`
                flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all
                ${activeTab === item.id 
                  ? "text-primary bg-primary/10 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }
              `}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};