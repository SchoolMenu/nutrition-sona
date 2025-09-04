import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, AlertTriangle, User, GraduationCap, Shield } from "lucide-react";
import { EditChildDialog } from "./EditChildDialog";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
  todayMeal?: string;
  hasOrderForWeek: boolean;
}

interface ChildProfileProps {
  child?: Child;
  onBack: () => void;
  onOrderMeals?: () => void;
  onChildUpdated?: () => void;
}

export const ChildProfile = ({ child, onBack, onOrderMeals, onChildUpdated }: ChildProfileProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!child) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Дитину не знайдено</h2>
        <Button onClick={onBack}>Повернутися назад</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Профіль дитини</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={""} alt={child.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{child.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <GraduationCap className="h-4 w-4" />
                <span>{child.grade} клас</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Алергії та обмеження
            </CardTitle>
          </CardHeader>
          <CardContent>
            {child.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {child.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Алергій не виявлено</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Замовлення на тиждень
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Статус замовлення:</span>
                <Badge variant={child.hasOrderForWeek ? "default" : "secondary"}>
                  {child.hasOrderForWeek ? "Активне" : "Немає замовлень"}
                </Badge>
              </div>
              {child.todayMeal && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Сьогоднішня страва: </span>
                  <span className="font-medium">{child.todayMeal}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Дії
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={onOrderMeals}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Замовити обіди
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              Редагувати профіль
            </Button>
          </div>
        </CardContent>
      </Card>

      {onChildUpdated && (
        <EditChildDialog
          child={child}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onChildUpdated={onChildUpdated}
        />
      )}
    </div>
  );
};