import { Building2, User, Lock } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: "admin" | "resident") => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            HACC
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Plataforma para la gestión de pagos 
            Residentes y administración de condominios.
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Usuario o correo electrónico
            </label>

            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

              <input
                type="text"
                placeholder="Ingrese su usuario"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

              <input
                type="password"
                placeholder="Ingrese su contraseña"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Ingresar
          </button>
        </form>

        {/* Debug */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-center text-slate-400 mb-3">
            Acceso rápido para pruebas
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onLogin("admin")}
              className="flex-1 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Admin
            </button>

            <button
              onClick={() => onLogin("resident")}
              className="flex-1 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Residente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}