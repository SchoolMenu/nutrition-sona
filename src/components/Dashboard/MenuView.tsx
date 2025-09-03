import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { mockMenuData, type DayMenu } from "@/data/menuData";

interface MenuViewProps {
  selectedChild?: string;
}

export const MenuView = ({ selectedChild }: MenuViewProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const currentDay = mockMenuData.days[selectedDayIndex];

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    } else if (direction === 'next' && selectedDayIndex < mockMenuData.days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const formatPrice = (price: number) => `${price} грн`;

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Меню на тиждень</CardTitle>
          <CardDescription>
            {mockMenuData.weekStart} - {mockMenuData.weekEnd}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Day Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('prev')}
              disabled={selectedDayIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">{currentDay.dayName}</h3>
              <p className="text-sm text-muted-foreground">{currentDay.date}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('next')}
              disabled={selectedDayIndex === mockMenuData.days.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-4">
        {/* Meal 1 Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Перша страва
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.meal1Options.map((meal) => (
              <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{meal.name}</h4>
                  <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{meal.description}</p>
                {meal.allergens.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {meal.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  Вибрати для дитини
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meal 2 Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Друга страва
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentDay.meal2Options.map((meal) => (
              <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{meal.name}</h4>
                  <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{meal.description}</p>
                {meal.allergens.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {meal.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  Вибрати для дитини
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Side Options */}
        {currentDay.sideOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Додатково
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentDay.sideOptions.map((meal) => (
                <div key={meal.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{meal.name}</h4>
                    <span className="font-semibold text-primary">{formatPrice(meal.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                  {meal.allergens.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      {meal.allergens.map((allergen) => (
                        <Badge key={allergen} variant="secondary" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    Вибрати для дитини
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};