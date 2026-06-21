import { createContext, useContext, useEffect, useState } from "react";

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  telefono: string;
  cedula: string;
};

type AuthContextType = {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (data: Usuario) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (data: Usuario) => {
    setUser(data);
    localStorage.setItem("usuario", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}