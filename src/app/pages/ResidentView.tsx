import { useState, useEffect } from "react";
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
  Plus,
  CreditCard as CardIcon,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { listarPagos, crearPago, type Pago } from "./pagosApi";
import {
  getPayPhoneConfig,
  usdToCents,
  formatUsd,
  generarClientTransactionId,
} from "./payphoneApi";

type ResidentPage = "dashboard" | "payments" | "reports" | "settings";

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
  { id: "payments" as ResidentPage, label: "Pagos", Icon: CreditCard },
  { id: "reports" as ResidentPage, label: "Reportes", Icon: FileText },
  { id: "settings" as ResidentPage, label: "Configuración", Icon: Settings },
];

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const fdate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d + "T00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

export default function ResidentView({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const [page, setPage] = useState<ResidentPage>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const residentName = user ? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim() || "Residente" : MOCK_RESIDENT.name;
  const residentEmail = user?.email ?? "carlos.mendoza@email.com";
  const residentId = user?.id ?? 0;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Sidebar con h-screen y sticky */}
        <>
          {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
          <aside className={`fixed top-0 left-0 z-50 w-64 h-screen flex flex-col bg-slate-900 transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:h-full`}>
            <div className="flex flex-col gap-3 px-5 py-5 border-b border-slate-800 shrink-0">
              <img
                src="/logo.png"
                alt="Logo CondoManager"
                className="w-full h-16 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold">CondoManager</p>
                  <p className="text-xs text-slate-400">Portal Residente</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{residentName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email ?? "Residente"}</p>
                </div>
                <button onClick={onLogout}>
                  <LogOut className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </aside>
        </>

        {/* Contenido derecho con scroll */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
                  {page === "payments" && "Mis Pagos"}
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

          <main className="flex-1 overflow-y-auto p-6">
            {page === "dashboard" && (
              <ResidentDashboardPage
                residentId={residentId}
                residentName={residentName}
                residentEmail={residentEmail}
              />
            )}

            {page === "payments" && (
              <ResidentPaymentsPage residentId={residentId} />
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

// ─── Dashboard del residente (con tabla de pagos) ──────────────────────────────

function ResidentDashboardPage({
  residentId,
  residentName,
  residentEmail,
}: {
  residentId: number;
  residentName: string;
  residentEmail: string;
}) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    if (!residentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const lista = await listarPagos(residentId);
      setPagos(lista);
    } catch (err) {
      console.error("Error cargando pagos del residente:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [residentId]);

  const pagosOrdenados = [...pagos].sort((a, b) => {
    const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
    const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
    return fb - fa;
  });

  const totalPagado = pagos.reduce((s, p) => s + (p.monto ?? 0), 0);
  const ultimoPago = pagosOrdenados[0]?.fecha ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Estado" value={pagos.length > 0 ? "Al día" : "Sin pagos"} />
        <Card title="Total pagado" value={formatUsd(totalPagado)} />
        <Card title="Último pago" value={fdate(ultimoPago)} />
        <Card title="Pagos registrados" value={`${pagos.length}`} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Mis datos personales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Info label="Nombre completo" value={residentName} />
          <Info label="Correo electrónico" value={residentEmail} />
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
              {loading ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">Cargando pagos...</td></tr>
              ) : pagosOrdenados.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">Aún no tienes pagos registrados</td></tr>
              ) : (
                pagosOrdenados.map(p => (
                  <tr key={p.id_pago} className="py-3">
                    <td className="py-3 text-slate-700 dark:text-slate-300">{p.titulo}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{fdate(p.fecha ?? null)}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{formatUsd(p.monto ?? 0)}</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">Pagado</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Pagos del residente (con PayPhone + registro manual) ─────────────────────

function ResidentPaymentsPage({ residentId }: { residentId: number }) {
  const { user } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayPhoneModal, setShowPayPhoneModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const cargar = async () => {
    if (!residentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const lista = await listarPagos(residentId);
      setPagos(lista);
    } catch (err) {
      console.error("Error cargando pagos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [residentId]);

  const totalPagado = pagos.reduce((s, p) => s + (p.monto ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total pagado" value={formatUsd(totalPagado)} />
        <Card title="Pagos registrados" value={`${pagos.length}`} />
        <Card title="Último pago" value={fdate(pagos[0]?.fecha ?? null)} />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Registrar pago manual
        </button>
        <button
          onClick={() => setShowPayPhoneModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <CardIcon className="w-4 h-4" />
          Pagar con PayPhone
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Mis pagos</h2>
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
              {loading ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">Cargando pagos...</td></tr>
              ) : pagos.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">Aún no tienes pagos registrados</td></tr>
              ) : (
                pagos.map(p => (
                  <tr key={p.id_pago} className="py-3">
                    <td className="py-3 text-slate-700 dark:text-slate-300">{p.titulo}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{fdate(p.fecha ?? null)}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{formatUsd(p.monto ?? 0)}</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">Pagado</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPayPhoneModal && (
        <PayPhoneModal
          user={user}
          onClose={() => setShowPayPhoneModal(false)}
        />
      )}

      {showManualModal && (
        <ManualPaymentModal
          residentId={residentId}
          onClose={() => setShowManualModal(false)}
          onSaved={cargar}
        />
      )}
    </div>
  );
}

// ─── Modal: Pagar con PayPhone ─────────────────────────────────────────────────

function PayPhoneModal({
  user,
  onClose,
}: {
  user: ReturnType<typeof useAuth>["user"];
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "payphone">("form");
  const [concepto, setConcepto] = useState("Alícuota de administración");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [phoneNumber, setPhoneNumber] = useState(user?.telefono ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [documentId, setDocumentId] = useState(user?.cedula ?? "");
  const [error, setError] = useState("");

  const config = getPayPhoneConfig();
  const montoNum = Number(monto);

  const handleContinuar = () => {
    setError("");
    if (!concepto.trim()) return setError("Selecciona un concepto.");
    if (!montoNum || montoNum <= 0) return setError("Ingresa un monto válido.");
    if (!fecha) return setError("Selecciona una fecha.");
    if (!phoneNumber.trim()) return setError("Ingresa tu número de teléfono.");
    if (!email.trim()) return setError("Ingresa tu correo electrónico.");
    if (!documentId.trim()) return setError("Ingresa tu número de identificación.");

    localStorage.setItem(
      "pago_pendiente",
      JSON.stringify({ titulo: concepto.trim(), monto: montoNum, fecha })
    );

    setStep("payphone");
  };

  useEffect(() => {
    if (step !== "payphone") return;

    const clientTransactionId = generarClientTransactionId();
    const amountCents = usdToCents(montoNum);

    const renderBox = () => {
      if (typeof window.PPaymentButtonBox === "undefined") {
        setError("No se cargó el SDK de PayPhone. Verifica tu conexión a internet.");
        return;
      }
      const container = document.getElementById("pp-button");
      if (container) container.innerHTML = "";

      new window.PPaymentButtonBox({
        token: config.token,
        clientTransactionId,
        amount: amountCents,
        amountWithoutTax: amountCents,
        currency: config.currency,
        storeId: config.storeId,
        reference: `${concepto} - Apto ${user?.id ?? ""}`,
        lang: "es",
        defaultMethod: "card",
        email: email.trim(),
        phoneNumber: phoneNumber.trim().startsWith("+") ? phoneNumber.trim() : `+${phoneNumber.trim()}`,
        documentId: documentId.trim(),
        identificationType: 1,
      }).render("pp-button");
    };

    const timer = setTimeout(renderBox, 100);
    return () => clearTimeout(timer);
  }, [step, montoNum, concepto, email, phoneNumber, documentId, config, user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {step === "form" ? "Pagar con PayPhone" : "Procesar pago"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "form" && (
          <div className="p-5 space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-xl text-sm bg-red-100 text-red-700">{error}</div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completa los datos del titular de la tarjeta. PayPhone los requiere para procesar el pago.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Concepto</label>
              <select
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Alícuota de administración</option>
                <option>Cuota de agua</option>
                <option>Cuota de electricidad</option>
                <option>Mantenimiento</option>
                <option>Cuota extraordinaria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monto (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="45.00"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {montoNum > 0 && (
                <p className="text-xs text-slate-500 mt-1">≈ {usdToCents(montoNum)} centavos</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha del pago</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tu email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tu teléfono (con código de país)</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+593999999999"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tu cédula / identificación</label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleContinuar}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"
              >
                Continuar al pago
              </button>
            </div>
          </div>
        )}

        {step === "payphone" && (
          <div className="p-5 space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-xl text-sm bg-red-100 text-red-700">{error}</div>
            )}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm">
              <p className="text-slate-600 dark:text-slate-300">
                Vas a pagar <span className="font-bold">{formatUsd(montoNum)}</span> por{" "}
                <span className="font-semibold">{concepto}</span>.
              </p>
            </div>
            <div id="pp-button" className="min-h-[60px]" />
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal: Registrar pago manual (sin PayPhone) ───────────────────────────────

function ManualPaymentModal({
  residentId,
  onClose,
  onSaved,
}: {
  residentId: number;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [titulo, setTitulo] = useState("Alícuota de administración");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegistrar = async () => {
    if (!residentId) {
      setMessage("❌ No se pudo identificar al residente");
      return;
    }
    const montoNum = Number(monto);
    if (!titulo.trim() || !montoNum || !fecha) {
      setMessage("❌ Completa todos los campos");
      return;
    }
    try {
      setSending(true);
      setMessage("");
      await crearPago({
        idResidente: residentId,
        titulo: titulo.trim(),
        monto: montoNum,
        fecha,
      });
      setMessage("✅ Pago registrado correctamente");
      await onSaved();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("[ManualPaymentModal] Error:", err);
      setMessage(`❌ Error: ${err?.message ?? "desconocido"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Registrar pago manual</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {message && (
            <div className={`px-3 py-2 rounded-xl text-sm ${message.startsWith("✅") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Concepto</label>
            <select
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Alícuota de administración</option>
              <option>Cuota de agua</option>
              <option>Cuota de electricidad</option>
              <option>Mantenimiento</option>
              <option>Cuota extraordinaria</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monto (USD)</label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="45.00"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha de pago</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegistrar}
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {sending ? "Guardando..." : "Confirmar"}
            </button>
          </div>
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