import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { AddChildDialog } from "./AddChildDialog";

interface Child {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  allergies: string[];
  hasOrderForWeek: boolean;
}

interface ChildrenCardsProps {
  children: Child[];
  onViewChild: (childId: string) => void;
  onOrderMeals: (childId: string) => void;
  onChildAdded: () => void;
}

export const ChildrenCards = ({ children, onViewChild, onOrderMeals, onChildAdded }: ChildrenCardsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Ваші діти</h3>
        <AddChildDialog onChildAdded={onChildAdded} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.avatar} alt={child.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base text-foreground">{child.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{child.grade} клас</p>
                </div>
                {child.hasOrderForWeek ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {child.allergies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {child.allergies.map((allergy, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onViewChild(child.id)}
                >
                  Переглянути
                </Button>
                <Button 
                  variant={child.hasOrderForWeek ? "secondary" : "default"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onOrderMeals(child.id)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  {child.hasOrderForWeek ? "Змінити" : "Замовити"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};