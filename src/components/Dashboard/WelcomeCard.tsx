import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Star, Users } from "lucide-react";
import heroImage from "@/assets/hero-lunch.jpg";

interface WelcomeCardProps {
  parentName: string;
  childrenCount: number;
  pendingOrders: number;
}

export const WelcomeCard = ({ 
  parentName, 
  childrenCount, 
  pendingOrders 
}: WelcomeCardProps) => {
  return (
    <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-lg overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <img 
          src={heroImage} 
          alt="School lunch" 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="relative p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Привіт, {parentName}! 👋
            </h2>
            <p className="text-primary-foreground/90 mt-1 text-sm sm:text-base">
              Замовлення шкільного обіду для ваших дітей
            </p>
          </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{childrenCount} {childrenCount === 1 ? 'дитина' : 'дітей'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{pendingOrders} активних замовлень</span>
              </div>
            </div>

          <Button 
            variant="secondary" 
            className="bg-accent text-accent-foreground hover:bg-accent-light border-0 shadow-md w-full sm:w-auto"
            onClick={() => {
              // Scroll to children section
              const childrenSection = document.querySelector('[data-section="children"]');
              if (childrenSection) {
                childrenSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Додати дитину або замовити</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};