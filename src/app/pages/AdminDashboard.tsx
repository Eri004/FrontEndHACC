import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, CreditCard, TrendingUp, TrendingDown,
  Zap, FileText, Settings, Bell, Search, Plus,
  Edit2, Trash2, Eye, Download, Menu, X,
  Moon, Sun, Building2, CheckCircle2, AlertTriangle,
  Clock, Droplets, Lightbulb, Wrench, Shield, Wifi,
  LogOut, ArrowUp, DollarSign, Filter, ChevronRight,
  UserPlus, Banknote, CalendarDays, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie,
  Cell, LineChart, Line,
} from "recharts";
import { useAuth } from "./AuthContext";


// ─── Types ───────────────────────────────────────────────────────────────────

type Page = "dashboard" | "residents" | "payments" | "finance" | "services" | "reports" | "settings";
type Status = "paid" | "overdue" | "pending";
type Priority = "high" | "medium" | "low";

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHLY = [
  { month: "Ene", ingresos: 8640000, gastos: 3200000 },
  { month: "Feb", ingresos: 8820000, gastos: 2800000 },
  { month: "Mar", ingresos: 7920000, gastos: 4100000 },
  { month: "Abr", ingresos: 9120000, gastos: 3600000 },
  { month: "May", ingresos: 8640000, gastos: 3100000 },
  { month: "Jun", ingresos: 6480000, gastos: 2900000 },
];

const BALANCE_TREND = [
  { month: "Ene", balance: 12400000 },
  { month: "Feb", balance: 18200000 },
  { month: "Mar", balance: 14100000 },
  { month: "Abr", balance: 21500000 },
  { month: "May", balance: 19800000 },
  { month: "Jun", balance: 16200000 },
];

const COLLECTION_RATE = [
  { month: "Ene", tasa: 91 },
  { month: "Feb", tasa: 94 },
  { month: "Mar", tasa: 88 },
  { month: "Abr", tasa: 96 },
  { month: "May", tasa: 89 },
  { month: "Jun", tasa: 83 },
];

const EXPENSE_CATS = [
  { name: "Mantenimiento", value: 35, color: "#2563EB" },
  { name: "Servicios", value: 28, color: "#10B981" },
  { name: "Seguridad", value: 20, color: "#F59E0B" },
  { name: "Operaciones", value: 12, color: "#8B5CF6" },
  { name: "Otros", value: 5, color: "#64748B" },
];


const PAYMENTS = [
  { id: 1, resident: "Carlos Mendoza", apt: "304-B", concept: "Alícuota junio 2026", amount: 180000, due: "2026-06-15", paid: "2026-06-01" as string | null, status: "paid" as Status },
  { id: 2, resident: "Ana Rodríguez", apt: "201-A", concept: "Alícuota junio 2026", amount: 180000, due: "2026-06-15", paid: null as string | null, status: "overdue" as Status },
  { id: 3, resident: "Lucía Martínez", apt: "103-A", concept: "Cuota agua mayo 2026", amount: 45000, due: "2026-06-10", paid: null as string | null, status: "pending" as Status },
  { id: 4, resident: "Andrés Torres", apt: "401-B", concept: "Alícuota mayo 2026", amount: 180000, due: "2026-05-15", paid: null as string | null, status: "overdue" as Status },
  { id: 5, resident: "Roberto Silva", apt: "502-B", concept: "Alícuota junio 2026", amount: 180000, due: "2026-06-15", paid: "2026-06-02" as string | null, status: "paid" as Status },
  { id: 6, resident: "Sergio Gómez", apt: "202-B", concept: "Mantenimiento junio", amount: 50000, due: "2026-06-20", paid: null as string | null, status: "pending" as Status },
  { id: 7, resident: "Valentina López", apt: "305-A", concept: "Alícuota junio 2026", amount: 180000, due: "2026-06-15", paid: "2026-06-03" as string | null, status: "paid" as Status },
  { id: 8, resident: "Diego Castillo", apt: "405-B", concept: "Alícuota junio 2026", amount: 180000, due: "2026-06-15", paid: null as string | null, status: "overdue" as Status },
];

const TRANSACTIONS = [
  { id: 1, date: "2026-06-10", desc: "Pago alícuota Apto  04-B", cat: "Ingresos", type: "income", amount: 180000 },
  { id: 2, date: "2026-06-09", desc: "Mantenimiento ascensor Torre B", cat: "Mantenimiento", type: "expense", amount: 350000 },
  { id: 3, date: "2026-06-08", desc: "Pago alícuota Apto 502-B", cat: "Ingresos", type: "income", amount: 180000 },
  { id: 4, date: "2026-06-07", desc: "Servicio de jardinería mensual", cat: "Mantenimiento", type: "expense", amount: 120000 },
  { id: 5, date: "2026-06-06", desc: "Pago alícuota Apto 601-A", cat: "Ingresos", type: "income", amount: 180000 },
  { id: 6, date: "2026-06-05", desc: "Factura energía zonas comunes", cat: "Servicios", type: "expense", amount: 280000 },
  { id: 7, date: "2026-06-04", desc: "Pago alícuota Apto 305-A", cat: "Ingresos", type: "income", amount: 180000 },
  { id: 8, date: "2026-06-03", desc: "Suministros de limpieza", cat: "Operaciones", type: "expense", amount: 85000 },
];

const SERVICES_DATA = [
  { id: 1, name: "Agua", status: "active", reading: "1,847 m³", provider: "Acueducto Bogotá", nextDue: "2026-06-25", monthly: 1200000, icon: "droplets", col: "blue" },
  { id: 2, name: "Electricidad", status: "active", reading: "12,450 kWh", provider: "Codensa", nextDue: "2026-06-20", monthly: 980000, icon: "lightbulb", col: "amber" },
  { id: 3, name: "Gas", status: "alert", reading: "284 m³", provider: "Gas Natural", nextDue: "2026-06-18", monthly: 420000, icon: "zap", col: "orange" },
  { id: 4, name: "Internet", status: "active", reading: "100 Mbps", provider: "Claro", nextDue: "2026-07-01", monthly: 250000, icon: "wifi", col: "purple" },
  { id: 5, name: "Seguridad", status: "active", reading: "24/7", provider: "SecurePro", nextDue: "2026-07-01", monthly: 850000, icon: "shield", col: "emerald" },
  { id: 6, name: "Aseo", status: "active", reading: "Diario", provider: "CleanCo", nextDue: "2026-07-01", monthly: 600000, icon: "wrench", col: "slate" },
];

const INCIDENTS = [
  { id: 1, service: "Gas", desc: "Olor a gas en Torre A, piso 3", reported: "2026-06-09", status: "open", priority: "high" as Priority },
  { id: 2, service: "Ascensor", desc: "Ascensor Torre B fuera de servicio", reported: "2026-06-08", status: "in-progress", priority: "high" as Priority },
  { id: 3, service: "Agua", desc: "Fuga menor en tubería del patio", reported: "2026-06-07", status: "resolved", priority: "medium" as Priority },
  { id: 4, service: "Electricidad", desc: "Lámparas del parqueadero fundidas", reported: "2026-06-05", status: "resolved", priority: "low" as Priority },
];

const ACTIVITY = [
  { id: 1, type: "payment", text: "Carlos Mendoza pagó alícuota junio", amount: 180000 as number | null, time: "Hace 2h" },
  { id: 2, type: "incident", text: "Nueva incidencia: olor a gas Torre A", amount: null as number | null, time: "Hace 4h" },
  { id: 3, type: "payment", text: "Roberto Silva pagó alícuota junio", amount: 180000 as number | null, time: "Hace 6h" },
  { id: 4, type: "resident", text: "Nuevo residente: Natalia Ríos, Apto 108-A", amount: null as number | null, time: "Ayer" },
  { id: 5, type: "payment", text: "Camila Herrera pagó alícuota junio", amount: 180000 as number | null, time: "Ayer" },
  { id: 6, type: "expense", text: "Gasto: Mantenimiento ascensor Torre B", amount: 350000 as number | null, time: "Ayer" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const fdate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d + "T00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();



function SvcIcon({ icon, cls }: { icon: string; cls: string }) {
  switch (icon) {
    case "droplets": return <Droplets className={cls} />;
    case "lightbulb": return <Lightbulb className={cls} />;
    case "zap": return <Zap className={cls} />;
    case "wifi": return <Wifi className={cls} />;
    case "shield": return <Shield className={cls} />;
    default: return <Wrench className={cls} />;
  }
}

const SVC_COLORS: Record<string, string> = {
  blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/30",
  amber: "text-amber-500 bg-amber-50 dark:bg-amber-900/30",
  orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/30",
  purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/30",
  emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30",
  slate: "text-slate-500 bg-slate-100 dark:bg-slate-700/40",
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status | string }) {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />Pagado
      </span>
    );
  if (status === "overdue")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
        <AlertTriangle className="w-3 h-3" />Vencido
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
      <Clock className="w-3 h-3" />Pendiente
    </span>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const styles: Record<Priority, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  const labels: Record<Priority, string> = { high: "Alta", medium: "Media", low: "Baja" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${styles[p]}`}>{labels[p]}</span>;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const palette = ["from-blue-500 to-blue-700", "from-violet-500 to-violet-700", "from-emerald-500 to-emerald-700", "from-rose-500 to-rose-700", "from-amber-500 to-amber-700", "from-cyan-500 to-cyan-700"];
  const color = palette[name.charCodeAt(0) % palette.length];
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials(name)}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon, trend, iconCls }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; trend?: { text: string; up: boolean }; iconCls: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between mb-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon className="w-5 h-5" />
        </span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${trend.up ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30"}`}>
            <ArrowUp className={`w-3 h-3 ${!trend.up ? "rotate-180" : ""}`} />{trend.text}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-1.5">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</p>
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs min-w-[180px]">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-bold text-foreground ml-auto">{cop(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PercentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-bold text-foreground ml-auto">{e.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", Icon: LayoutDashboard },
  { id: "residents" as Page, label: "Residentes", Icon: Users },
  { id: "payments" as Page, label: "Pagos", Icon: CreditCard, badge: 3 },
  { id: "finance" as Page, label: "Finanzas", Icon: TrendingUp },
  { id: "services" as Page, label: "Servicios", Icon: Zap, badge: 1 },
  { id: "reports" as Page, label: "Reportes", Icon: FileText },
  { id: "settings" as Page, label: "Configuración", Icon: Settings },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  page,
  setPage,
  open,
  onClose,
  onLogout,
}: {
  page: Page;
  setPage: (p: Page) => void;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const nav = (p: Page) => {
  setPage(p);
  onClose();
};
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-slate-900 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100">El Parque</p>
            <p className="text-xs text-slate-500">Panel de Administración</p>
          </div>
          <button onClick={onClose} className="lg:hidden w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menú principal</p>
          {NAV.map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => nav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${page === id ? "bg-blue-600 text-white shadow-md shadow-blue-900/50" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge != null && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">{badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">MG</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">María González</p>
              <p className="text-xs text-slate-500">Administradora</p>
            </div>
            <button
  onClick={onLogout}
  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
>
  <LogOut className="w-3.5 h-3.5" />
</button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const PAGE_META: Record<Page, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Resumen general · Conjunto El Parque · Junio 2026" },
  residents: { title: "Residentes", sub: "Gestión de propietarios y arrendatarios" },
  payments: { title: "Pagos", sub: "Alícuotas, servicios y cuotas extraordinarias" },
  finance: { title: "Finanzas", sub: "Ingresos, gastos y balance contable" },
  services: { title: "Servicios", sub: "Estado de servicios e incidencias" },
  reports: { title: "Reportes", sub: "Generación y exportación de informes" },
  settings: { title: "Configuración", sub: "Perfil del administrador y ajustes del sistema" },
};

function Header({ page, onMenu, dark, setDark }: { page: Page; onMenu: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  const meta = PAGE_META[page];
  return (
    <header className="flex items-center gap-4 px-4 lg:px-6 py-3.5 bg-card border-b border-border sticky top-0 z-30">
      <button onClick={onMenu} className="lg:hidden w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-extrabold text-foreground leading-tight">{meta.title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">{meta.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border w-44">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Buscar..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
        </div>
        <button className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
        </button>
        <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

type Resident = {
  id_residente: number;
  nombre: string | null;
  apellido: string | null;
  departamento: string | null;
  telefono: string | null;
  ultimoPago: string | null;
  deuda: number | null;
  estado: string | null;
};

async function fetchResidents(): Promise<Resident[]> {
  const res = await fetch("http://localhost:8080/residentes");
  if (!res.ok) throw new Error("Error al obtener residentes");
  return res.json();
}


// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents()
      .then(setResidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRecaudado = residents
    .filter(r => (r.deuda ?? 0) === 0)
    .length; // o suma de pagos si tu backend lo da

  const porCobrar = residents.reduce((s, r) => s + (r.deuda ?? 0), 0);
  const obligacionesPendientes = residents.filter(r => (r.deuda ?? 0) > 0).length;

  const debtors = residents.filter(r => (r.deuda ?? 0) > 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total recaudado" value={cop(totalRecaudado)} sub="Junio 2026"
          icon={DollarSign} iconCls="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
          trend={{ text: "+8.2%", up: true }} />
        <KPICard label="Por cobrar" value={cop(porCobrar)} sub={`${obligacionesPendientes} obligaciones`}
          icon={AlertTriangle} iconCls="text-red-600 bg-red-50 dark:bg-red-900/30"
          trend={{ text: "-3.1%", up: false }} />
        <KPICard label="Residentes" value={`${residents.length}`} sub="Unidades registradas"
          icon={Users} iconCls="text-blue-600 bg-blue-50 dark:bg-blue-900/30" />
        <KPICard label="Gastos del mes" value={cop(0)} sub="Mantenimiento + servicios"
          icon={Banknote} iconCls="text-purple-600 bg-purple-50 dark:bg-purple-900/30"
          trend={{ text: "+12%", up: false }} />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-foreground">Ingresos vs Gastos</h2>
              <p className="text-xs text-muted-foreground">Enero – Junio 2026</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" />Ingresos</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600" />Gastos</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY} barGap={3} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.04 }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Actividad reciente</h2>
            <button className="text-xs font-semibold text-primary">Ver todo</button>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.type === "payment" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  a.type === "incident" ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                    a.type === "resident" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                  {a.type === "payment" ? <CreditCard className="w-3.5 h-3.5" /> :
                    a.type === "incident" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                      a.type === "resident" ? <Users className="w-3.5 h-3.5" /> :
                        <Banknote className="w-3.5 h-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug font-medium">{a.text}</p>
                  {a.amount != null && <p className="text-xs font-bold text-muted-foreground mt-0.5">{cop(a.amount)}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Debtors table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <h2 className="font-bold text-foreground">Residentes con deuda vencida</h2>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">{debtors.length}</span>
          </div>
          <button onClick={() => setPage("payments")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Gestionar →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Residente", "Departamento", "Deuda total", "Último pago", "Estado", "Acción"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {debtors.map(r => (
                <tr key={r.id_residente} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3"><Avatar name={`${r.nombre || "Sin nombre"} ${r.apellido || ""}`} size="sm" /><span className="font-semibold text-foreground">{`${r.nombre || "Sin nombre"} ${r.apellido || ""}`}</span></div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.departamento ?? "N/A"}</td>
                  <td className="px-5 py-3.5 font-bold text-red-600 dark:text-red-400">{cop(r.deuda ?? 0)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(r.ultimoPago ?? "-")}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.estado ?? "pendiente"} /></td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Cobrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Residents ────────────────────────────────────────────────────────────────
const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) => (
  <div>
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
      {label}
    </label>

    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder ?? ""}
      disabled={disabled}
      className={`w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none transition-all ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

function ResidentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {
    fetchResidents()
      .then(setResidents)
      .catch(err => console.error("Error cargando residentes:", err));
  }, []);


  const statusMap: Record<string, string> = { Todos: "", Pagado: "paid", Pendiente: "pending", Vencido: "overdue" };
  const filtered = residents.filter(r => {
    const nombreCompleto = `${r.nombre ?? ""} ${r.apellido ?? ""}`.toLowerCase();
    const ms =
      nombreCompleto.includes(search.toLowerCase()) ||
      (r.departamento ?? "").toLowerCase().includes(search.toLowerCase());

    const mf =
      filterStatus === "Todos" ||
      (r.estado ?? "").toLowerCase() === statusMap[filterStatus];

    return ms && mf;
  });



  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    departamento: "",
    torre: "Torre A",
    email: "",
    telefono: "",
  });


  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8080/residentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Error al guardar residente");
      }

      const nuevosResidentes = await fetchResidents();
      setResidents(nuevosResidentes);

      setForm({
        nombre: "",
        apellido: "",
        departamento: "",
        torre: "Torre A",
        email: "",
        telefono: "",
      });

      // Mostrar mensaje
      setMessage("✅ Residente registrado correctamente");

      // Cerrar modal
      setShowModal(false);


      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Error al registrar residente");
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`http://localhost:8080/residentes/${deleteTarget.id_residente}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar residente");
      // refrescar lista
      fetchResidents().then(setResidents);
      setShowDeleteModal(false);
      setDeleteTarget(null);


    } catch (err) {
      console.error(err);
    }
  };




  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">
      {message && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl">
          {message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar residente..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Todos", "Pagado", "Pendiente", "Vencido"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="ml-auto shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          <UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Nuevo residente</span><span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Total", value: residents.length, cls: "text-foreground" },
        { label: "Al día", value: residents.filter(r => (r.estado ?? "").toLowerCase() === "paid").length, cls: "text-emerald-600 dark:text-emerald-400" },
        { label: "Con deuda", value: residents.filter(r => (r.deuda ?? 0) > 0).length, cls: "text-red-600 dark:text-red-400" }].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className={`text-2xl font-extrabold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {["Residente", "Departamento", "Teléfono", "Último pago", "Deuda", "Estado", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id_residente} className="hover:bg-muted/20 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`} size="sm" />
                    <span className="font-semibold text-foreground">{`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.departamento ?? "N/A"}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.telefono ?? "-"}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(r.ultimoPago ?? "-")}</td>
                <td className="px-5 py-3.5 font-semibold">
                  {(r.deuda ?? 0) > 0
                    ? <span className="text-red-600 dark:text-red-400">{cop(r.deuda ?? 0)}</span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={r.estado ?? "pendiente"} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button
                      onClick={() => { setDeleteTarget(r); setShowDeleteModal(true); }}
                      className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-14 text-center text-muted-foreground text-sm">Sin resultados</div>}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2">
        {filtered.map(r => (
          <div key={r.id_residente} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar name={`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.departamento ?? "N/A"}
                </p>
              </div>
              <StatusBadge status={r.estado ?? "pendiente"} />
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Último pago</p>
                <p className="text-xs font-medium text-foreground">
                  {fdate(r.ultimoPago ?? "-")}
                </p>
              </div>
              {(r.deuda ?? 0) > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Deuda</p>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    {cop(r.deuda ?? 0)}
                  </p>
                </div>
              )}
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                <button
                  onClick={() => { setDeleteTarget(r); setShowDeleteModal(true); }}
                  className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Nuevo residente" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
              />
              <Field
                label="Apellido"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Pérez"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Apartamento"
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
                placeholder="204"
              />
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Torre</label>
                <select
                  name="torre"
                  value={form.torre}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm"
                >
                  <option value="Torre A">Torre A</option>
                  <option value="Torre B">Torre B</option>
                </select>
              </div>
            </div>
            <Field
              label="Correo electrónico"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juan@correo.com"
              type="email"
            />
            <Field
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="+57 300 000 0000"
              type="tel"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button
                onClick={() => {
                  console.log("CLICK REGISTRAR");
                  handleSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Registrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl shadow-lg border border-border w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-3">Confirmar eliminación</h2>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Está seguro de que quiere eliminar al residente <strong>{deleteTarget.nombre} {deleteTarget.apellido}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// ─── Payments ─────────────────────────────────────────────────────────────────

function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const statusMap: Record<string, string> = { Todos: "", Pagado: "pagado", Pendiente: "pending", Vencido: "overdue" };

  const filtered = PAYMENTS.filter(p => filterStatus === "Todos" || p.status === statusMap[filterStatus]);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Recaudado", val: PAYMENTS.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0), count: PAYMENTS.filter(p => p.status === "paid").length, grad: "from-emerald-500 to-emerald-700" },
          { label: "Pendiente", val: PAYMENTS.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0), count: PAYMENTS.filter(p => p.status === "pending").length, grad: "from-amber-400 to-amber-600" },
          { label: "Vencido", val: PAYMENTS.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0), count: PAYMENTS.filter(p => p.status === "overdue").length, grad: "from-red-500 to-red-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.grad} p-4 text-white shadow-sm`}>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
            <p className="text-xl font-extrabold mt-1">{cop(s.val)}</p>
            <p className="text-white/60 text-xs mt-1">{s.count} pagos</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Todos", "Pagado", "Pendiente", "Vencido"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
            <Filter className="w-3.5 h-3.5" />Filtrar
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
            <Plus className="w-3.5 h-3.5" />Registrar pago
          </button>
        </div>
      </div>

      <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {["Residente", "Departamento", "Concepto", "Monto", "Vencimiento", "F. Pago", "Estado", ""].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={p.resident} size="sm" /><span className="font-semibold text-foreground">{p.resident}</span></div></td>
                <td className="px-5 py-3.5 text-muted-foreground">{p.apt}</td>
                <td className="px-5 py-3.5 text-foreground">{p.concept}</td>
                <td className="px-5 py-3.5 font-bold text-foreground">{cop(p.amount)}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(p.due)}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(p.paid)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3.5">
                  {p.status !== "paid" && (
                    <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100">Registrar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin resultados</div>}
      </div>

      <div className="lg:hidden space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.resident} size="sm" />
                <div><p className="font-semibold text-foreground text-sm">{p.resident}</p><p className="text-xs text-muted-foreground">{p.concept}</p></div>
              </div>
              <div className="text-right shrink-0"><p className="font-extrabold text-foreground">{cop(p.amount)}</p><StatusBadge status={p.status} /></div>
            </div>
            {p.status !== "paid" && (
              <button className="mt-3 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all">Registrar pago</button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Registrar pago manual" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Residente</label>
              <select className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none appearance-none">
                {residents.map(r => (
                  <option key={r.id_residente}>
                    {`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`} — {r.departamento ?? "N/A"}
                  </option>
                ))}              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Concepto</label>
              <select className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none appearance-none">
                <option>Alícuota de administración</option><option>Cuota de agua</option><option>Cuota de electricidad</option><option>Mantenimiento</option><option>Cuota extraordinaria</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Monto (COP)</label>
                <input type="number" placeholder="180000" className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Fecha de pago</label>
                <input type="date" defaultValue="2026-06-12" className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Método de pago</label>
              <select className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none appearance-none">
                <option>Transferencia bancaria</option><option>Efectivo</option><option>PSE</option><option>Nequi / Daviplata</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">Confirmar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────────

function FinancePage() {
  const [showForm, setShowForm] = useState(false);
  const [txType, setTxType] = useState<"income" | "expense">("expense");

  const totalIncome = TRANSACTIONS.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = TRANSACTIONS.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Balance hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-8 bottom-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Balance general · Junio 2026</p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight">{cop(balance)}</p>
          <div className="flex flex-wrap items-center gap-6 mt-4">
            <div><p className="text-slate-400 text-xs">Ingresos</p><p className="text-emerald-400 font-bold mt-0.5">{cop(totalIncome)}</p></div>
            <div className="w-px h-8 bg-white/10" />
            <div><p className="text-slate-400 text-xs">Gastos</p><p className="text-red-400 font-bold mt-0.5">{cop(totalExpense)}</p></div>
            <div className="w-px h-8 bg-white/10" />
            <div><p className="text-slate-400 text-xs">Tasa de cobro</p><p className="text-blue-400 font-bold mt-0.5">83%</p></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-1">Tendencia del balance</h2>
          <p className="text-xs text-muted-foreground mb-4">Acumulado mensual 2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={BALANCE_TREND}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CurrencyTooltip />} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#2563EB" strokeWidth={2.5} fill="url(#balGrad)" dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#2563EB" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-1">Distribución de gastos</h2>
          <p className="text-xs text-muted-foreground mb-4">Por categoría</p>
          <div className="flex flex-col items-center">
            <PieChart width={170} height={150}>
              <Pie data={EXPENSE_CATS} cx={85} cy={75} innerRadius={48} outerRadius={70} dataKey="value" paddingAngle={2}>
                {EXPENSE_CATS.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
              </Pie>
            </PieChart>
            <div className="w-full space-y-1.5 mt-2">
              {EXPENSE_CATS.map(e => (
                <div key={e.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: e.color }} /><span className="text-xs text-muted-foreground">{e.name}</span></div>
                  <span className="text-xs font-bold text-foreground">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add transaction */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between px-5 py-4 border-b border-border hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /><h2 className="font-bold text-foreground">Registrar transacción</h2></div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showForm ? "rotate-90" : ""}`} />
        </button>
        {showForm && (
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              {(["income", "expense"] as const).map(t => (
                <button key={t} onClick={() => setTxType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${txType === t ? (t === "income" ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-500 text-white border-red-500") : "bg-muted/30 text-muted-foreground border-transparent hover:text-foreground"}`}>
                  {t === "income" ? "Ingreso" : "Gasto"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[["Monto (COP)", "number", "0"], ["Descripción", "text", "Ej. Mantenimiento ascensor Torre B"]].map(([label, type, ph]) => (
                <div key={label as string}>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
                  <input type={type as string} placeholder={ph as string} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Fecha</label>
                <input type="date" defaultValue="2026-06-12" className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Categoría</label>
                <select className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none appearance-none">
                  <option>Mantenimiento</option><option>Servicios</option><option>Operaciones</option><option>Seguridad</option><option>Ingresos</option>
                </select>
              </div>
            </div>
            <button className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">Guardar</button>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Últimas transacciones</h2>
          <button className="text-xs font-semibold text-primary">Ver todas</button>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>{["Fecha", "Descripción", "Categoría", "Tipo", "Monto"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TRANSACTIONS.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(t.date)}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{t.desc}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{t.cat}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === "income" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"}`}>
                      {t.type === "income" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 font-bold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}{cop(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden divide-y divide-border">
          {TRANSACTIONS.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                {t.type === "income" ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                <p className="text-xs text-muted-foreground">{t.cat} · {fdate(t.date)}</p>
              </div>
              <p className={`font-bold text-sm shrink-0 ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {t.type === "income" ? "+" : "-"}{cop(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total servicios", value: `${SERVICES_DATA.length}`, sub: "activos o programados", cls: "text-foreground" },
          { label: "Costo mensual", value: cop(SERVICES_DATA.reduce((s, sv) => s + sv.monthly, 0)), sub: "junio 2026", cls: "text-foreground" },
          { label: "Incidencias activas", value: `${INCIDENTS.filter(i => i.status !== "resolved").length}`, sub: "requieren atención", cls: "text-red-600 dark:text-red-400" },
          { label: "Con alerta", value: `${SERVICES_DATA.filter(s => s.status === "alert").length}`, sub: "servicios en alerta", cls: "text-amber-600 dark:text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1.5 ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Estado de servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES_DATA.map(s => (
            <div key={s.id} className={`bg-card rounded-2xl border p-4 hover:shadow-sm transition-all ${s.status === "alert" ? "border-amber-300 dark:border-amber-700" : "border-border"}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${SVC_COLORS[s.col]}`}>
                  <SvcIcon icon={s.icon} cls="w-5 h-5" />
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"}`}>
                  {s.status === "active" ? "Activo" : "⚠ Alerta"}
                </span>
              </div>
              <h3 className="font-bold text-foreground">{s.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{s.provider}</p>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Lectura</p><p className="text-xs font-bold text-foreground mt-0.5">{s.reading}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Mensual</p><p className="text-xs font-bold text-foreground mt-0.5">{cop(s.monthly)}</p></div>
                <div className="col-span-2"><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Próx. vencimiento</p><p className="text-xs font-bold text-foreground mt-0.5">{fdate(s.nextDue)}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><h2 className="font-bold text-foreground">Incidencias reportadas</h2></div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-3.5 h-3.5" />Nueva
          </button>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>{["#", "Servicio", "Descripción", "Reportado", "Prioridad", "Estado"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INCIDENTS.map(i => (
                <tr key={i.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground text-xs font-mono">#{String(i.id).padStart(3, "0")}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">{i.service}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-xs">{i.desc}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(i.reported)}</td>
                  <td className="px-5 py-3.5"><PriorityBadge p={i.priority} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${i.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : i.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"}`}>
                      {i.status === "resolved" ? "Resuelto" : i.status === "in-progress" ? "En progreso" : "Abierto"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden divide-y divide-border">
          {INCIDENTS.map(i => (
            <div key={i.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">#{String(i.id).padStart(3, "0")}</span>
                    <span className="font-semibold text-foreground text-sm">{i.service}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                </div>
                <PriorityBadge p={i.priority} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${i.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : i.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"}`}>
                  {i.status === "resolved" ? "Resuelto" : i.status === "in-progress" ? "En progreso" : "Abierto"}
                </span>
                <span className="text-xs text-muted-foreground">{fdate(i.reported)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [period, setPeriod] = useState("jun-2026");

  const reportTypes = [
    { title: "Reporte financiero", desc: "Ingresos, gastos y balance del período", Icon: TrendingUp, cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
    { title: "Reporte de residentes", desc: "Estado de pagos y deudas por unidad", Icon: Users, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
    { title: "Reporte de servicios", desc: "Consumos, costos e incidencias del período", Icon: Zap, cls: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
    { title: "Reporte de mora", desc: "Residentes con deuda acumulada", Icon: AlertTriangle, cls: "text-red-600 bg-red-50 dark:bg-red-900/30" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-bold text-foreground mb-3">Período de reporte</h2>
        <div className="flex flex-wrap gap-2">
          {[{ v: "jun-2026", l: "Junio 2026" }, { v: "may-2026", l: "Mayo 2026" }, { v: "abr-2026", l: "Abril 2026" }, { v: "q2-2026", l: "Q2 2026" }].map(p => (
            <button key={p.v} onClick={() => setPeriod(p.v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${period === p.v ? "bg-primary text-white border-primary shadow-sm" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {p.l}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <CalendarDays className="w-3.5 h-3.5" />Personalizado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Recaudado", value: cop(720000), delta: "+8.2%", up: true },
          { label: "Gastos", value: cop(835000), delta: "+12%", up: false },
          { label: "Tasa de cobro", value: "83%", delta: "-6pp", up: false },
          { label: "Unidades al día", value: "7/10", delta: "70%", up: true },
        ].map(m => (
          <div key={m.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</p>
            <p className="text-xl font-extrabold text-foreground mt-1.5">{m.value}</p>
            <p className={`text-xs font-semibold mt-1 ${m.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{m.delta} vs mes anterior</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-bold text-foreground mb-1">Tasa de cobro mensual</h2>
        <p className="text-xs text-muted-foreground mb-4">% de alícuotas cobradas — 2026</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={COLLECTION_RATE}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<PercentTooltip />} />
            <Line type="monotone" dataKey="tasa" name="Tasa cobro" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Generar reportes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reportTypes.map(r => (
            <div key={r.title} className="bg-card rounded-2xl border border-border p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4 mb-4">
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${r.cls}`}><r.Icon className="w-5 h-5" /></span>
                <div className="flex-1"><h3 className="font-bold text-foreground">{r.title}</h3><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  <Download className="w-3.5 h-3.5" />PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-emerald-600 hover:border-emerald-400/40 transition-all">
                  <Download className="w-3.5 h-3.5" />Excel
                </button>
                <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">Generar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPage({ dark, setDark }: { dark: boolean; setDark: (d: boolean) => void }) {
  const [notifs, setNotifs] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [autoReminders, setAutoReminders] = useState(false);
  const [editUser, setEditUser] = useState(false);
const [loading, setLoading] = useState(false);
const { user: authUser } = useAuth();

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

 const handleSave = async () => {
  try {
    setLoading(true);

    await fetch(`http://localhost:8080/residentes/${authUser?.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    setEditUser(false); // salir de modo edición
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const [config, setConfig] = useState({
    nombre: "Conjunto Residencial El Parque",
    direccion: "Cra. 15 #80-45, Bogotá D.C.",
    nit: "890.920.123-4",
    alicuota: "$180.000 COP",
    unidades: "48",
    torres: "2 (Torre A y Torre B)",
  });

  const [user, setUser] = useState({
  nombre: "",
  cedula: "",
  email: "",
  telefono: "",
});

useEffect(() => {
  if (authUser) {
    setUser({
      nombre: authUser.nombre || "",
      cedula: authUser.cedula || "",
      email: authUser.email || "",
      telefono: authUser.telefono || "",
    });
  }
}, [authUser]);

  const handleConfigChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Perfil del administrador</h2>
        <div className="flex items-center gap-4 mb-5">  
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-xl">
  {authUser?.nombre?.charAt(0)}
  {authUser?.apellido?.charAt(0)}
</span>

          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">
  {authUser?.nombre} {authUser?.apellido}
</p>
            <p className="text-sm text-muted-foreground">
  {authUser?.rol}
</p>  
            <p className="text-xs text-muted-foreground mt-0.5">Conjunto Residencial El Parque</p>
          </div>
          <button
  onClick={async () => {
    if (editUser) {
      await handleSave();
      setEditUser(false);
    } else {
      setEditUser(true);
    }
  }}
  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
>
  {editUser ? "💾" : <Edit2 className="w-4 h-4" />}
</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
  label="Nombre completo"
  name="nombre"
  value={user.nombre}
  onChange={handleUserChange}
  placeholder="Nombre completo"
  disabled={!editUser}
/>

<Field
  label="Cédula"
  name="cedula"
  value={user.cedula}
  onChange={handleUserChange}
  placeholder="Cédula"
  disabled={!editUser}
/>

<Field
  label="Correo electrónico"
  name="email"
  value={user.email}
  onChange={handleUserChange}
  placeholder="Correo electrónico"
  type="email"
  disabled={!editUser}
/>

<Field
  label="Teléfono"
  name="telefono"
  value={user.telefono}
  onChange={handleUserChange}
  placeholder="Teléfono"
  disabled={!editUser}
/>
        </div>
        <button 
        onClick={handleSave}
        className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">Guardar cambios</button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Configuración del conjunto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Nombre del conjunto"
            name="nombre"
            value={config.nombre}
            onChange={handleConfigChange}
            placeholder="Nombre del conjunto"
          />

          <Field
            label="Dirección"
            name="direccion"
            value={config.direccion}
            onChange={handleConfigChange}
            placeholder="Dirección"
          />

          <Field
            label="NIT / Matrícula"
            name="nit"
            value={config.nit}
            onChange={handleConfigChange}
            placeholder="NIT / Matrícula"
          />

          <Field
            label="Alícuota base mensual"
            name="alicuota"
            value={config.alicuota}
            onChange={handleConfigChange}
            placeholder="Alícuota base mensual"
          />

          <Field
            label="Total unidades"
            name="unidades"
            value={config.unidades}
            onChange={handleConfigChange}
            placeholder="Total unidades"
          />

          <Field
            label="Torres"
            name="torres"
            value={config.torres}
            onChange={handleConfigChange}
            placeholder="Torres"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notificaciones y automatizaciones</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Notificaciones push", sub: "Alertas de pagos vencidos e incidencias", value: notifs, onChange: () => setNotifs(v => !v) },
            { label: "Reportes por correo", sub: "Resumen mensual enviado automáticamente", value: emailReports, onChange: () => setEmailReports(v => !v) },
            { label: "Recordatorios automáticos", sub: "Aviso 5 días antes del vencimiento", value: autoReminders, onChange: () => setAutoReminders(v => !v) },
            { label: "Modo oscuro", sub: "Interfaz en colores oscuros", value: dark, onChange: () => setDark(!dark) },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-4">
              <div><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p></div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Seguridad</h2>
        </div>
        <div className="divide-y divide-border">
          {["Cambiar contraseña", "Verificación en 2 pasos", "Sesiones activas", "Historial de accesos"].map(item => (
            <button key={item} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <p className="text-sm font-medium text-foreground">{item}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-red-200 dark:border-red-900/50 p-5">
        <h2 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3">Zona de peligro</h2>
        <p className="text-xs text-muted-foreground mb-3">Estas acciones son irreversibles. Proceder con precaución.</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/50 transition-all">Exportar todos los datos</button>
          <button className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 text-xs font-semibold hover:bg-red-100 transition-all">Restablecer sistema</button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "residents": return <ResidentsPage />;
      case "payments": return <PaymentsPage />;
      case "finance": return <FinancePage />;
      case "services": return <ServicesPage />;
      case "reports": return <ReportsPage />;
      case "settings": return <SettingsPage dark={dark} setDark={setDark} />;
    }
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-background">
       <Sidebar
  page={page}
  setPage={setPage}
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onLogout={onLogout}
/>

        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <Header
            page={page}
            onMenu={() => setSidebarOpen(true)}
            dark={dark}
            setDark={setDark}
          />

          <main className="flex-1">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}