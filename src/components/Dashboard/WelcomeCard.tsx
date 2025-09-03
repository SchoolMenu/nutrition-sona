import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Star } from "lucide-react";
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
      <CardContent className="relative p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              Привіт, {parentName}! 👋
            </h2>
            <p className="text-primary-foreground/90 mt-1">
              Замовлення шкільного обіду для ваших дітей
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>{childrenCount} дітей</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{pendingOrders} активних замовлень</span>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="bg-accent text-accent-foreground hover:bg-accent-light border-0 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Нове замовлення
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};