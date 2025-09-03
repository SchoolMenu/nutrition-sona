import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChefHat, Settings } from "lucide-react";
import sonaLogo from "@/assets/sona-logo.png";

interface RoleSelectorProps {
  onRoleSelect: (role: 'parent' | 'kitchen' | 'admin') => void;
}

export const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  const roles = [
    {
      id: 'parent' as const,
      title: 'Батьки',
      description: 'Замовлення обідів для дітей, керування профілями та відстеження витрат',
      icon: Users,
      color: 'bg-primary',
      example: 'Оксана Петренко'
    },
    {
      id: 'kitchen' as const,
      title: 'Кухня', 
      description: 'Перегляд денних замовлень, підготовка страв та керування виробництвом',
      icon: ChefHat,
      color: 'bg-accent',
      example: 'Кухар Олена'
    },
    {
      id: 'admin' as const,
      title: 'Адміністратор',
      description: 'Управління меню, аналітика продажів та фінансові звіти',
      icon: Settings,
      color: 'bg-primary-light',
      example: 'Адмін Ірина'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center text-primary-foreground">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={sonaLogo} alt="SONA" className="h-16 w-16" />
            <h1 className="text-4xl font-bold">СОНА</h1>
          </div>
          <h2 className="text-xl font-medium mb-2">Система Онлайн Навчання та Адміністрування</h2>
          <p className="text-primary-foreground/90">Виберіть свою роль для входу в систему</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-surface/95 backdrop-blur"
              onClick={() => onRoleSelect(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow`}>
                  <role.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-foreground">{role.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {role.description}
                </p>
                
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  Приклад: {role.example}
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoleSelect(role.id);
                  }}
                >
                  Увійти як {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-primary-foreground/70 text-sm">
          <p>Ця демонстрація показує різні інтерфейси для батьків, кухні та адміністраторів</p>
        </div>
      </div>
    </div>
  );
};