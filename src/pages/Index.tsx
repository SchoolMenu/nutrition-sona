import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./Dashboard";
import KitchenDashboard from "./KitchenDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { user, profile, loading, profileLoading } = useAuth();

  // Show loading while auth is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user exists but no profile, show error (could be new user or RLS issue)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Профіль не знайдено</h2>
          <p className="text-muted-foreground mb-4">Можливо, ваш профіль ще створюється або виникла помилка доступу.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Оновити сторінку
          </button>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'parent':
      return <Dashboard />;
    case 'cook':
      return <KitchenDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Index;
