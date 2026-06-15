import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentView from "./pages/ResidentView";

export default function App() {
  const [role, setRole] = useState<"admin" | "resident" | null>(null);

  const handleLogin = (selectedRole: "admin" | "resident") => {
    setRole(selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  if (role === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (role === "resident") {
    return <ResidentView onLogout={handleLogout} />;
  }

  return <LoginPage onLogin={handleLogin} />;
}