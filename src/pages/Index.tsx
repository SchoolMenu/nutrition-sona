import { useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import Dashboard from "./Dashboard";
import KitchenDashboard from "./KitchenDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'kitchen' | 'admin' | null>(null);

  const handleRoleSelect = (role: 'parent' | 'kitchen' | 'admin') => {
    setSelectedRole(role);
  };

  if (!selectedRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  switch (selectedRole) {
    case 'parent':
      return <Dashboard />;
    case 'kitchen':
      return <KitchenDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }
};

export default Index;
