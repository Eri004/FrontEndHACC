import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  LogOut,
  Moon,
  Sun,
  Building2,
  CreditCard,
  User,
  Shield,
  Menu,
  X,
} from "lucide-react";

type ResidentPage = "dashboard" | "reports" | "settings";

const MOCK_RESIDENT = {
  name: "Carlos Mendoza",
  apartment: "304",
  tower: "B",
  debt: 0,
  lastPayment: "01/06/2026",
  nextDue: "15/07/2026",
};

const NAV = [
  { id: "dashboard" as ResidentPage, label: "Dashboard", Icon: LayoutDashboard },
  { id: "reports" as ResidentPage, label: "Reportes", Icon: FileText },
  { id: "settings" as ResidentPage, label: "Configuración", Icon: Settings },
];

export default function ResidentView({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<ResidentPage>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar con h-screen y sticky */}
        <>
          {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
          <aside className={`fixed top-0 left-0 z-50 w-64 h-screen flex flex-col bg-slate-900 transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}>
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold">CondoManager</p>
                <p className="text-xs text-slate-400">Portal Residente</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setPage(id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition ${page === id ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{MOCK_RESIDENT.name}</p>
                  <p className="text-xs text-slate-400">Apto {MOCK_RESIDENT.apartment}</p>
                </div>
                <button onClick={onLogout}>
                  <LogOut className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </aside>
        </>

        {/* Contenido derecho con scroll */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:flex w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-xl">
                  {page === "dashboard" && "Mi Dashboard"}
                  {page === "reports" && "Mis Reportes"}
                  {page === "settings" && "Mi Configuración"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Portal del residente</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDark(!dark)}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          <main className="p-6">
            {/* ... resto del contenido igual ... */}
            {page === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card title="Estado" value="Al día" />
                  <Card title="Deuda" value="$0" />
                  <Card title="Último pago" value={MOCK_RESIDENT.lastPayment} />
                  <Card title="Próximo vencimiento" value={MOCK_RESIDENT.nextDue} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4">Mis datos personales</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Info label="Nombre completo" value={MOCK_RESIDENT.name} />
                    <Info label="Departamento" value={`${MOCK_RESIDENT.apartment} - Torre ${MOCK_RESIDENT.tower}`} />
                    <Info label="Correo electrónico" value="carlos.mendoza@email.com" />
                    <Info label="Teléfono" value="+57 320 456 7890" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-slate-900 dark:text-white">Historial de pagos</h2>
                    <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-2">Concepto</th>
                          <th className="pb-2">Fecha</th>
                          <th className="pb-2">Monto</th>
                          <th className="pb-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr className="py-3">
                          <td className="py-3 text-slate-700 dark:text-slate-300">Alícuota Junio</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">01/06/2026</td>
                          <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">$180,000</td>
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">Pagado</td>
                        </tr>
                        <tr className="py-3">
                          <td className="py-3 text-slate-700 dark:text-slate-300">Agua Mayo</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">25/05/2026</td>
                          <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">$45,000</td>
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">Pagado</td>
                        </tr>
                        <tr className="py-3">
                          <td className="py-3 text-slate-700 dark:text-slate-300">Alícuota Mayo</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">01/05/2026</td>
                          <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">$180,000</td>
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">Pagado</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {page === "reports" && (
              <div className="grid md:grid-cols-3 gap-4">
                <ReportCard title="Estado de cuenta" />
                <ReportCard title="Comprobante último pago" />
                <ReportCard title="Historial completo" />
              </div>
            )}

            {page === "settings" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4">Notificaciones</h2>
                  <SettingOption title="Recordatorios de pago" type="toggle" defaultChecked={true} />
                  <SettingOption title="Incidencias del conjunto" type="toggle" defaultChecked={true} />
                  <SettingOption title="Avisos administrativos" type="toggle" defaultChecked={true} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4">Automatizaciones</h2>
                  <SettingOption title="Recordatorio automático de vencimiento" type="toggle" defaultChecked={true} />
                  <SettingOption title="Alerta de nueva deuda" type="toggle" defaultChecked={true} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h2 className="font-bold text-slate-900 dark:text-white">Seguridad</h2>
                  </div>
                  <SettingOption title="Cambiar contraseña" actionText="Cambiar" />
                  <SettingOption title="Verificación en 2 pasos" type="toggle" defaultChecked={false} />
                  <SettingOption title="Sesiones activas" actionText="Ver sesiones" />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SettingOption({ 
  title, 
  description, 
  type = "button",
  actionText,
  defaultChecked = false,
}: { 
  title: string;
  description?: string;
  type?: "button" | "toggle";
  actionText?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {type === "toggle" ? (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        ) : (
          <button 
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {actionText || "Configurar"}
          </button>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ReportCard({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <h3 className="font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <button className="w-full py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
        Descargar PDF
      </button>
    </div>
  );
}