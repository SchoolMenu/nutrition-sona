import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import sonaLogo from "@/assets/sona-logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  userName?: string;
}

export const Header = ({ userName }: HeaderProps) => {
  const { signOut, profile } = useAuth();
  
  const displayName = profile?.full_name || userName || "Користувач";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <img src={sonaLogo} alt="SONA" className="h-7 w-7 sm:h-8 sm:w-8" />
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">СОНА</h1>
            <p className="text-xs text-muted-foreground">Шкільне харчування</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src="/placeholder-avatar.png" alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {displayName}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            className="hover:bg-secondary"
            title="Вийти"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};