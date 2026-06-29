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

const API_BASE_URL = "http://localhost:8080";

// ─── Types ───────────────────────────────────────────────────────────────────

type Page = "dashboard" | "residents" | "payments" | "finance" | "services" | "reports" | "settings";
type Status = "paid" | "overdue" | "pending";
type Priority = "high" | "medium" | "low";

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

type Building = {
  idEdificio: number;
  nombre: string;
  direccion: string;
  totalUnidades: number;
  unidades?: Unit[];
};

type Unit = {
  idUnidad: number;
  numero: string;
  torre: string;
  estado: string;
  idEdificio: number;
};

type Transaccion = {
  idTransaccion: number;
  titulo: string;
  monto: number;
  tipo: "INGRESO" | "EGRESO";
  categoria: string;
  fecha: string;
  idPropietario: number;
};

type Servicio = {
  idServicio: number;
  nombre: string;
  montoFacturado: number;
  fechaVencimiento: string;
  estado: string;
  idPropietario: number;
};

type Pago = {
  id_pago: number;
  idResidente: number;
  titulo: string;
  monto: number;
  fecha: string | null;
  fechaVencimiento: string;
  estado: string;
};

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

// ─── Field component ──────────────────────────────────────────────────────────

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
      className={`w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm text-foreground border border-transparent focus:border-primary focus:outline-none transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    />
  </div>
);

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", Icon: LayoutDashboard },
  { id: "residents" as Page, label: "Residentes", Icon: Users },
  { id: "payments" as Page, label: "Pagos", Icon: CreditCard },
  { id: "finance" as Page, label: "Finanzas", Icon: TrendingUp },
  { id: "services" as Page, label: "Servicios", Icon: Zap },
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

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menú principal</p>
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => nav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${page === id ? "bg-blue-600 text-white shadow-md shadow-blue-900/50" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
            </button>
          ))}
        </nav>

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
  dashboard: { title: "Dashboard", sub: "Resumen general · Conjunto El Parque" },
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

// ─── API Functions ──────────────────────────────────────────────────────────

async function fetchResidents(): Promise<Resident[]> {
  const res = await fetch(`${API_BASE_URL}/residentes`);
  if (!res.ok) throw new Error("Error al obtener residentes");
  return res.json();
}

async function fetchBuildings(userId: number): Promise<Building[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/edificios/propietario/${userId}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Error al obtener edificios");
    const data = await res.json();
    return data.edificios || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchTransactions(userId: number): Promise<Transaccion[]> {
  const res = await fetch(`${API_BASE_URL}/finanzas/transacciones/propietario/${userId}`);
  if (!res.ok) throw new Error("Error al obtener transacciones");
  return res.json();
}

async function fetchServices(userId: number): Promise<Servicio[]> {
  const res = await fetch(`${API_BASE_URL}/finanzas/servicios/propietario/${userId}`);
  if (!res.ok) throw new Error("Error al obtener servicios");
  return res.json();
}

async function fetchPayments(userId: number): Promise<Pago[]> {
  const res = await fetch(`${API_BASE_URL}/pagos/residente/${userId}`);
  if (!res.ok) throw new Error("Error al obtener pagos");
  return res.json();
}

// ─── Modales ──────────────────────────────────────────────────────────────────

function AddBuildingModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({ nombre: "", direccion: "", totalUnidades: 0 });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.direccion.trim()) { setError("La dirección es obligatoria"); return; }
    setError("");
    await onSave(form);
  };

  return (
    <Modal title="Nuevo edificio" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
        <Field label="Nombre *" name="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Torre A" />
        <Field label="Dirección *" name="direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle 123 #45-67" />
        <Field label="Total unidades" name="totalUnidades" type="number" value={String(form.totalUnidades)} onChange={(e) => setForm({ ...form, totalUnidades: Number(e.target.value) || 0 })} placeholder="48" />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : "Crear edificio"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddUnitModal({
  edificioId,
  onClose,
  onSave,
  saving,
}: {
  edificioId: number;
  onClose: () => void;
  onSave: (edificioId: number, units: any[]) => Promise<void>;
  saving: boolean;
}) {
  const [units, setUnits] = useState([{ numero: "", torre: "Torre A", estado: "DISPONIBLE" }]);
  const [error, setError] = useState("");

  const addUnit = () => setUnits([...units, { numero: "", torre: "Torre A", estado: "DISPONIBLE" }]);
  const removeUnit = (index: number) => { if (units.length > 1) setUnits(units.filter((_, i) => i !== index)); };
  const updateUnit = (index: number, field: string, value: string) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const handleSubmit = async () => {
    const valid = units.filter(u => u.numero.trim() !== "");
    if (valid.length === 0) { setError("Agrega al menos una unidad con número válido"); return; }
    setError("");
    await onSave(edificioId, valid);
  };

  return (
    <Modal title="Agregar unidades" onClose={onClose}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
        {units.map((unit, index) => (
          <div key={index} className="flex gap-2 items-start bg-muted/30 p-3 rounded-xl">
            <div className="flex-1">
              <Field label="Número *" name={`numero-${index}`} value={unit.numero} onChange={(e) => updateUnit(index, "numero", e.target.value)} placeholder="Ej. 101" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Torre</label>
              <select value={unit.torre} onChange={(e) => updateUnit(index, "torre", e.target.value)} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
                <option value="Torre A">Torre A</option>
                <option value="Torre B">Torre B</option>
                <option value="Torre C">Torre C</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Estado</label>
              <select value={unit.estado} onChange={(e) => updateUnit(index, "estado", e.target.value)} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
                <option value="DISPONIBLE">Disponible</option>
                <option value="OCUPADO">Ocupado</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>
            </div>
            <button onClick={() => removeUnit(index)} className="mt-6 w-8 h-8 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addUnit} className="w-full py-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
          <Plus className="w-4 h-4 inline mr-1" /> Agregar otra unidad
        </button>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar unidades"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddResidentModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({ nombre: "", apellido: "", departamento: "", torre: "Torre A", email: "", telefono: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.departamento.trim() || !form.email.trim() || !form.telefono.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError("");
    await onSave(form);
  };

  return (
    <Modal title="Nuevo residente" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan" />
          <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Pérez" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Apartamento" name="departamento" value={form.departamento} onChange={handleChange} placeholder="204" />
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Torre</label>
            <select name="torre" value={form.torre} onChange={handleChange} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
              <option value="Torre A">Torre A</option>
              <option value="Torre B">Torre B</option>
            </select>
          </div>
        </div>
        <Field label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@correo.com" />
        <Field label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="+57 300 000 0000" />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddTransactionModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    titulo: "",
    monto: 0,
    tipo: "EGRESO",
    categoria: "MANTENIMIENTO",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim() || form.monto <= 0) {
      setError("Título y monto son obligatorios (monto > 0)");
      return;
    }
    setError("");
    await onSave(form);
  };

  return (
    <Modal title="Nueva transacción" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
        <Field label="Título" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej. Pago de alícuota" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="SERVICIOS_BASICOS">Servicios Básicos</option>
              <option value="OPERACIONES">Operaciones</option>
              <option value="SEGURIDAD">Seguridad</option>
              <option value="INGRESOS_EXTRA">Ingresos Extra</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>
        </div>
        <Field label="Monto (COP)" name="monto" type="number" value={String(form.monto)} onChange={handleChange} placeholder="150000" />
        <Field label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddServiceModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    nombre: "AGUA",
    montoFacturado: 0,
    fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.montoFacturado <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    setError("");
    await onSave(form);
  };

  return (
    <Modal title="Nuevo servicio" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Nombre</label>
          <select name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
            <option value="AGUA">Agua</option>
            <option value="ELECTRICIDAD">Electricidad</option>
            <option value="GAS">Gas</option>
            <option value="INTERNET">Internet</option>
            <option value="SEGURIDAD">Seguridad</option>
            <option value="ASEO">Aseo</option>
            <option value="OTROS">Otros</option>
          </select>
        </div>
        <Field label="Monto facturado (COP)" name="montoFacturado" type="number" value={String(form.montoFacturado)} onChange={handleChange} placeholder="150000" />
        <Field label="Fecha vencimiento" name="fechaVencimiento" type="date" value={form.fechaVencimiento} onChange={handleChange} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPage({
  userId,
  buildings,
  selectedBuildingId,
  onAddUnits,
  loadingBuildings,
  onAddBuilding,
  transactions,
}: {
  userId: number;
  buildings: Building[];
  selectedBuildingId: number | null;
  onAddUnits: (edificioId: number, units: any[]) => Promise<void>;
  loadingBuildings: boolean;
  onAddBuilding: () => void;
  transactions: Transaccion[];
}) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  useEffect(() => {
    fetchResidents()
      .then(setResidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loadingBuildings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando edificios...</p>
        </div>
      </div>
    );
  }

  if (buildings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <Building2 className="w-20 h-20 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Aún no tienes edificios</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Registra tu primer edificio para comenzar a gestionar las unidades y sus residentes.
        </p>
        <button
          onClick={onAddBuilding}
          className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 inline mr-2" /> Agregar edificio
        </button>
      </div>
    );
  }

  const selectedBuilding = buildings.find(b => b.idEdificio === selectedBuildingId);
  const allUnits = buildings.flatMap(b => b.unidades || []);
  const filteredUnits = selectedBuildingId ? (selectedBuilding?.unidades || []) : allUnits;

  const totalUnits = filteredUnits.length;
  const occupied = filteredUnits.filter(u => u.estado === "OCUPADO").length;
  const available = filteredUnits.filter(u => u.estado === "DISPONIBLE").length;
  const maintenance = filteredUnits.filter(u => u.estado === "MANTENIMIENTO").length;

  const totalIngresos = transactions.filter(t => t.tipo === "INGRESO").reduce((s, t) => s + t.monto, 0);
  const totalEgresos = transactions.filter(t => t.tipo === "EGRESO").reduce((s, t) => s + t.monto, 0);
  const balance = totalIngresos - totalEgresos;
  const debtors = residents.filter(r => (r.deuda ?? 0) > 0);

  // Agrupar transacciones por mes para gráficos
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.fecha.substring(0, 7);
    if (!acc[month]) acc[month] = { month, ingresos: 0, gastos: 0 };
    if (t.tipo === "INGRESO") acc[month].ingresos += t.monto;
    else acc[month].gastos += t.monto;
    return acc;
  }, {} as Record<string, { month: string; ingresos: number; gastos: number }>);
  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Balance trend
  let runningBalance = 0;
  const balanceTrend = transactions
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .reduce((acc, t) => {
      runningBalance += t.tipo === "INGRESO" ? t.monto : -t.monto;
      const month = t.fecha.substring(0, 7);
      const existing = acc.find(item => item.month === month);
      if (existing) existing.balance = runningBalance;
      else acc.push({ month, balance: runningBalance });
      return acc;
    }, [] as { month: string; balance: number }[]);

  // Tasa de cobro (simulada)
  const collectionRate = chartData.map(d => ({
    month: d.month,
    tasa: Math.round((d.ingresos / (d.ingresos + d.gastos || 1)) * 100),
  }));

  // Distribución de gastos por categoría
  const expenseCats = transactions
    .filter(t => t.tipo === "EGRESO")
    .reduce((acc, t) => {
      const key = t.categoria;
      if (!acc[key]) acc[key] = 0;
      acc[key] += t.monto;
      return acc;
    }, {} as Record<string, number>);
  const totalExpense = Object.values(expenseCats).reduce((a, b) => a + b, 0);
  const expenseData = Object.entries(expenseCats).map(([name, value]) => ({
    name,
    value: totalExpense ? Math.round((value / totalExpense) * 100) : 0,
    color: ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#64748B"][Object.keys(expenseCats).indexOf(name) % 5],
  }));

  const activity = transactions
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5)
    .map(t => ({
      id: t.idTransaccion,
      type: t.tipo === "INGRESO" ? "payment" : "expense",
      text: t.titulo,
      amount: t.monto,
      time: fdate(t.fecha),
    }));

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Balance actual" value={cop(balance)} sub="General"
          icon={DollarSign} iconCls="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
          trend={{ text: balance >= 0 ? "+" : "-", up: balance >= 0 }} />
        <KPICard label="Ingresos" value={cop(totalIngresos)} sub="Total"
          icon={TrendingUp} iconCls="text-blue-600 bg-blue-50 dark:bg-blue-900/30" />
        <KPICard label="Egresos" value={cop(totalEgresos)} sub="Total"
          icon={TrendingDown} iconCls="text-red-600 bg-red-50 dark:bg-red-900/30" />
        <KPICard label="Residentes" value={`${residents.length}`} sub="Registrados"
          icon={Users} iconCls="text-purple-600 bg-purple-50 dark:bg-purple-900/30" />
      </div>

      {/* Botón para agregar unidades */}
      {selectedBuildingId && (
        <button
          onClick={() => setShowAddUnitModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Agregar unidades a {selectedBuilding?.nombre}
        </button>
      )}

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-foreground">Ingresos vs Gastos</h2>
              <p className="text-xs text-muted-foreground">Transacciones por mes</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" />Ingresos</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600" />Gastos</span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No hay transacciones</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={3} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.04 }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Actividad reciente</h2>
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">Sin actividad reciente</div>
            ) : (
              activity.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.type === "payment" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {a.type === "payment" ? <CreditCard className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug font-medium">{a.text}</p>
                    {a.amount != null && <p className="text-xs font-bold text-muted-foreground mt-0.5">{cop(a.amount)}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
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
        </div>
        {debtors.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Todos los residentes están al día</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {["Residente", "Departamento", "Deuda total", "Último pago", "Estado"].map(h => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddUnitModal && selectedBuildingId && (
        <AddUnitModal
          edificioId={selectedBuildingId}
          onClose={() => setShowAddUnitModal(false)}
          onSave={onAddUnits}
          saving={false}
        />
      )}
    </div>
  );
}

// ─── Residents ────────────────────────────────────────────────────────────────

function ResidentsPage({ userId }: { userId: number }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await fetchResidents();
      setResidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const statusMap: Record<string, string> = { Todos: "", Pagado: "paid", Pendiente: "pending", Vencido: "overdue" };
  const filtered = residents.filter(r => {
    const nombreCompleto = `${r.nombre ?? ""} ${r.apellido ?? ""}`.toLowerCase();
    const ms = nombreCompleto.includes(search.toLowerCase()) || (r.departamento ?? "").toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "Todos" || (r.estado ?? "").toLowerCase() === statusMap[filterStatus];
    return ms && mf;
  });

  const handleAddResident = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/residentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear residente");
      await cargar();
      setShowModal(false);
      setFormMessage("✅ Residente registrado correctamente");
      setTimeout(() => setFormMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setFormMessage("❌ Error al registrar residente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este residente?")) return;
    try {
      await fetch(`${API_BASE_URL}/residentes/${id}`, { method: "DELETE" });
      await cargar();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">
      {formMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-xl shadow">
          {formMessage}
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

      {loading ? (
        <div className="py-14 text-center text-muted-foreground text-sm">Cargando residentes...</div>
      ) : residents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">Sin residentes</h3>
          <p className="text-sm text-muted-foreground mb-4">Comienza registrando el primer residente</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
            <UserPlus className="w-4 h-4 inline mr-2" /> Registrar residente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: residents.length, cls: "text-foreground" },
              { label: "Al día", value: residents.filter(r => (r.estado ?? "").toLowerCase() === "paid").length, cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Con deuda", value: residents.filter(r => (r.deuda ?? 0) > 0).length, cls: "text-red-600 dark:text-red-400" }
            ].map(s => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
                <p className={`text-2xl font-extrabold ${s.cls}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

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
                      {(r.deuda ?? 0) > 0 ? <span className="text-red-600 dark:text-red-400">{cop(r.deuda ?? 0)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.estado ?? "pendiente"} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(r.id_residente)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-14 text-center text-muted-foreground text-sm">Sin resultados</div>}
          </div>

          <div className="lg:hidden space-y-2">
            {filtered.map(r => (
              <div key={r.id_residente} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{`${r.nombre ?? "Sin nombre"} ${r.apellido ?? ""}`}</p>
                    <p className="text-xs text-muted-foreground">{r.departamento ?? "N/A"}</p>
                  </div>
                  <StatusBadge status={r.estado ?? "pendiente"} />
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Último pago</p>
                    <p className="text-xs font-medium text-foreground">{fdate(r.ultimoPago ?? "-")}</p>
                  </div>
                  {(r.deuda ?? 0) > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Deuda</p>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">{cop(r.deuda ?? 0)}</p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(r.id_residente)} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && <AddResidentModal onClose={() => setShowModal(false)} onSave={handleAddResident} saving={saving} />}
    </div>
  );
}

// ─── Payments ─────────────────────────────────────────────────────────────────

function PaymentsPage({ userId }: { userId: number }) {
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [payments, setPayments] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments(userId)
      .then(setPayments)
      .catch(err => { setError("No se pudieron cargar los pagos"); console.error(err); })
      .finally(() => setLoading(false));
  }, [userId]);

  const statusMap: Record<string, string> = { Todos: "", Pagado: "paid", Pendiente: "pending", Vencido: "overdue" };
  const filtered = payments.filter(p => {
    const estado = p.fecha ? "paid" : "pending";
    return filterStatus === "Todos" || estado === statusMap[filterStatus];
  });

  const totalRecaudado = payments.filter(p => p.fecha).reduce((s, p) => s + p.monto, 0);
  const totalPendiente = payments.filter(p => !p.fecha).reduce((s, p) => s + p.monto, 0);
  const countRecaudado = payments.filter(p => p.fecha).length;
  const countPendiente = payments.filter(p => !p.fecha).length;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">
      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Recaudado", val: totalRecaudado, count: countRecaudado, grad: "from-emerald-500 to-emerald-700" },
          { label: "Pendiente", val: totalPendiente, count: countPendiente, grad: "from-amber-400 to-amber-600" },
          { label: "Total", val: totalRecaudado + totalPendiente, count: payments.length, grad: "from-blue-500 to-blue-700" },
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
          {["Todos", "Pagado", "Pendiente"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-14 text-center text-muted-foreground text-sm">Cargando pagos...</div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">Sin pagos registrados</h3>
          <p className="text-sm text-muted-foreground">Aún no se han registrado pagos para este propietario.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {["Concepto", "Monto", "F. Vencimiento", "Estado"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id_pago} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-foreground">{p.titulo}</td>
                    <td className="px-5 py-3.5 font-bold text-foreground">{cop(p.monto)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(p.fechaVencimiento)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.fecha ? "paid" : "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin resultados</div>}
          </div>

          <div className="lg:hidden space-y-2">
            {filtered.map(p => (
              <div key={p.id_pago} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">Vence: {fdate(p.fechaVencimiento)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-foreground">{cop(p.monto)}</p>
                    <StatusBadge status={p.fecha ? "paid" : "pending"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────────

function FinancePage({ userId }: { userId: number }) {
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions(userId);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [userId]);

  const totalIncome = transactions.filter(t => t.tipo === "INGRESO").reduce((s, t) => s + t.monto, 0);
  const totalExpense = transactions.filter(t => t.tipo === "EGRESO").reduce((s, t) => s + t.monto, 0);
  const balance = totalIncome - totalExpense;

  // Agrupar por mes para tendencia
  let runningBalance = 0;
  const balanceTrend = transactions
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .reduce((acc, t) => {
      runningBalance += t.tipo === "INGRESO" ? t.monto : -t.monto;
      const month = t.fecha.substring(0, 7);
      const existing = acc.find(item => item.month === month);
      if (existing) existing.balance = runningBalance;
      else acc.push({ month, balance: runningBalance });
      return acc;
    }, [] as { month: string; balance: number }[]);

  // Distribución de gastos
  const expenseCats = transactions
    .filter(t => t.tipo === "EGRESO")
    .reduce((acc, t) => {
      const key = t.categoria;
      if (!acc[key]) acc[key] = 0;
      acc[key] += t.monto;
      return acc;
    }, {} as Record<string, number>);
  const totalExp = Object.values(expenseCats).reduce((a, b) => a + b, 0);
  const expenseData = Object.entries(expenseCats).map(([name, value]) => ({
    name,
    value: totalExp ? Math.round((value / totalExp) * 100) : 0,
    color: ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#64748B"][Object.keys(expenseCats).indexOf(name) % 5],
  }));

  const handleAddTransaction = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/finanzas/transacciones?idPropietario=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear transacción");
      await cargar();
      setShowForm(false);
      setFormMessage("✅ Transacción registrada");
      setTimeout(() => setFormMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setFormMessage("❌ Error al registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {formMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-xl shadow">
          {formMessage}
        </div>
      )}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Balance general</p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight">{cop(balance)}</p>
          <div className="flex flex-wrap items-center gap-6 mt-4">
            <div><p className="text-slate-400 text-xs">Ingresos</p><p className="text-emerald-400 font-bold mt-0.5">{cop(totalIncome)}</p></div>
            <div className="w-px h-8 bg-white/10" />
            <div><p className="text-slate-400 text-xs">Gastos</p><p className="text-red-400 font-bold mt-0.5">{cop(totalExpense)}</p></div>
            <div className="w-px h-8 bg-white/10" />
            <div><p className="text-slate-400 text-xs">Transacciones</p><p className="text-blue-400 font-bold mt-0.5">{transactions.length}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-1">Tendencia del balance</h2>
          <p className="text-xs text-muted-foreground mb-4">Acumulado por mes</p>
          {balanceTrend.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={balanceTrend}>
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
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-1">Distribución de gastos</h2>
          <p className="text-xs text-muted-foreground mb-4">Por categoría</p>
          {expenseData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sin gastos</div>
          ) : (
            <div className="flex flex-col items-center">
              <PieChart width={170} height={150}>
                <Pie data={expenseData} cx={85} cy={75} innerRadius={48} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {expenseData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
              </PieChart>
              <div className="w-full space-y-1.5 mt-2">
                {expenseData.map(e => (
                  <div key={e.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: e.color }} /><span className="text-xs text-muted-foreground">{e.name}</span></div>
                    <span className="text-xs font-bold text-foreground">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between px-5 py-4 border-b border-border hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /><h2 className="font-bold text-foreground">Registrar transacción</h2></div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showForm ? "rotate-90" : ""}`} />
        </button>
        {showForm && <AddTransactionModal onClose={() => setShowForm(false)} onSave={handleAddTransaction} saving={saving} />}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Últimas transacciones</h2>
        </div>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">No hay transacciones registradas</div>
        ) : (
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>{["Fecha", "Descripción", "Categoría", "Tipo", "Monto"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 10).map(t => (
                  <tr key={t.idTransaccion} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{fdate(t.fecha)}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{t.titulo}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.categoria}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${t.tipo === "INGRESO" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"}`}>
                        {t.tipo === "INGRESO" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 font-bold ${t.tipo === "INGRESO" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {t.tipo === "INGRESO" ? "+" : "-"}{cop(t.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="lg:hidden divide-y divide-border">
          {transactions.slice(0, 10).map(t => (
            <div key={t.idTransaccion} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.tipo === "INGRESO" ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                {t.tipo === "INGRESO" ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.titulo}</p>
                <p className="text-xs text-muted-foreground">{t.categoria} · {fdate(t.fecha)}</p>
              </div>
              <p className={`font-bold text-sm shrink-0 ${t.tipo === "INGRESO" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {t.tipo === "INGRESO" ? "+" : "-"}{cop(t.monto)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesPage({ userId }: { userId: number }) {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await fetchServices(userId);
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [userId]);

  const estados = ["Todos", "PENDIENTE", "PAGADO", "CORTADO", "EN_DEUDA", "ANULADO"];
  const filtered = services.filter(s => filterEstado === "Todos" || s.estado === filterEstado);

  const handleAddService = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/finanzas/servicios?idPropietario=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear servicio");
      await cargar();
      setShowModal(false);
      setFormMessage("✅ Servicio registrado");
      setTimeout(() => setFormMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setFormMessage("❌ Error al registrar");
    } finally {
      setSaving(false);
    }
  };

  const totalMensual = services.reduce((s, sv) => s + sv.montoFacturado, 0);
  const pendientes = services.filter(s => s.estado === "PENDIENTE").length;
  const pagados = services.filter(s => s.estado === "PAGADO").length;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {formMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-xl shadow">
          {formMessage}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total servicios", value: services.length, sub: "registrados", cls: "text-foreground" },
          { label: "Costo mensual", value: cop(totalMensual), sub: "total", cls: "text-foreground" },
          { label: "Pendientes", value: pendientes, sub: "por pagar", cls: "text-amber-600 dark:text-amber-400" },
          { label: "Pagados", value: pagados, sub: "al día", cls: "text-emerald-600 dark:text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1.5 ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {estados.map(s => (
            <button key={s} onClick={() => setFilterEstado(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterEstado === s ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="ml-auto shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> Nuevo servicio
        </button>
      </div>

      {loading ? (
        <div className="py-14 text-center text-muted-foreground text-sm">Cargando servicios...</div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Zap className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">Sin servicios</h3>
          <p className="text-sm text-muted-foreground mb-4">Registra tu primer servicio para llevar el control</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4 inline mr-2" /> Registrar servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => {
            const iconMap: Record<string, string> = {
              AGUA: "droplets", ELECTRICIDAD: "lightbulb", GAS: "zap",
              INTERNET: "wifi", SEGURIDAD: "shield", ASEO: "wrench",
            };
            const colMap: Record<string, string> = {
              AGUA: "blue", ELECTRICIDAD: "amber", GAS: "orange",
              INTERNET: "purple", SEGURIDAD: "emerald", ASEO: "slate",
            };
            const icon = iconMap[s.nombre] || "wrench";
            const col = colMap[s.nombre] || "slate";
            const estadoColor = s.estado === "PAGADO" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/50 dark:text-emerald-400" :
              s.estado === "PENDIENTE" ? "text-amber-700 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-400" :
              "text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-400";
            return (
              <div key={s.idServicio} className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${SVC_COLORS[col]}`}>
                    <SvcIcon icon={icon} cls="w-5 h-5" />
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${estadoColor}`}>
                    {s.estado}
                  </span>
                </div>
                <h3 className="font-bold text-foreground">{s.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Vence: {fdate(s.fechaVencimiento)}</p>
                <div className="mt-3 pt-3 border-t border-border flex justify-between">
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Monto</p><p className="text-xs font-bold text-foreground mt-0.5">{cop(s.montoFacturado)}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddServiceModal onClose={() => setShowModal(false)} onSave={handleAddService} saving={saving} />}
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

  async function downloadReport(url: string, body: any, fileName: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

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

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-bold text-foreground mb-1">Tasa de cobro mensual</h2>
        <p className="text-xs text-muted-foreground mb-4">% de alícuotas cobradas — 2026</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={[{ month: "Ene", tasa: 91 }, { month: "Feb", tasa: 94 }, { month: "Mar", tasa: 88 }, { month: "Abr", tasa: 96 }, { month: "May", tasa: 89 }, { month: "Jun", tasa: 83 }]}>
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
                <button
                  onClick={() => downloadReport(`${API_BASE_URL}/api/reports/generate`, { period, type: "financial", format: "pdf" }, `reporte-${period}.pdf`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />PDF
                </button>
                <button
                  onClick={() => downloadReport(`${API_BASE_URL}/api/reports/generate`, { period, type: "financial", format: "excel" }, `reporte-${period}.xlsx`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-emerald-600 transition-all"
                >
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

function SettingsPage({ dark, setDark, userId }: { dark: boolean; setDark: (d: boolean) => void; userId: number }) {
  const [notifs, setNotifs] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [autoReminders, setAutoReminders] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

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

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/residentes/${authUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      setEditUser(false);
      alert("Datos actualizados");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Perfil del administrador</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-xl">
              {authUser?.nombre?.charAt(0)}{authUser?.apellido?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">{authUser?.nombre} {authUser?.apellido}</p>
            <p className="text-sm text-muted-foreground">{authUser?.rol}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Conjunto Residencial El Parque</p>
          </div>
          <button onClick={() => setEditUser(!editUser)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {editUser ? "💾" : <Edit2 className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre completo" name="nombre" value={user.nombre} onChange={handleUserChange} placeholder="Nombre completo" disabled={!editUser} />
          <Field label="Cédula" name="cedula" value={user.cedula} onChange={handleUserChange} placeholder="Cédula" disabled={!editUser} />
          <Field label="Correo electrónico" name="email" value={user.email} onChange={handleUserChange} placeholder="Correo electrónico" type="email" disabled={!editUser} />
          <Field label="Teléfono" name="telefono" value={user.telefono} onChange={handleUserChange} placeholder="Teléfono" disabled={!editUser} />
        </div>
        {editUser && (
          <button onClick={handleSave} disabled={loading} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Configuración del conjunto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre del conjunto" name="nombre" value={config.nombre} onChange={handleConfigChange} placeholder="Nombre del conjunto" />
          <Field label="Dirección" name="direccion" value={config.direccion} onChange={handleConfigChange} placeholder="Dirección" />
          <Field label="NIT / Matrícula" name="nit" value={config.nit} onChange={handleConfigChange} placeholder="NIT / Matrícula" />
          <Field label="Alícuota base mensual" name="alicuota" value={config.alicuota} onChange={handleConfigChange} placeholder="Alícuota base mensual" />
          <Field label="Total unidades" name="unidades" value={config.unidades} onChange={handleConfigChange} placeholder="Total unidades" />
          <Field label="Torres" name="torres" value={config.torres} onChange={handleConfigChange} placeholder="Torres" />
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
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: authUser } = useAuth();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [savingBuilding, setSavingBuilding] = useState(false);
  const [savingUnits, setSavingUnits] = useState(false);
  const [transactions, setTransactions] = useState<Transaccion[]>([]);

  // Cargar edificios y transacciones
  useEffect(() => {
    if (!authUser?.id) {
      setLoadingBuildings(false);
      return;
    }
    Promise.all([
      fetchBuildings(authUser.id),
      fetchTransactions(authUser.id),
    ])
      .then(([buildingsData, txData]) => {
        setBuildings(buildingsData);
        setTransactions(txData);
        if (buildingsData.length > 0) {
          setSelectedBuildingId(buildingsData[0].idEdificio);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBuildings(false));
  }, [authUser]);

  const handleAddBuilding = async (buildingData: any) => {
    if (!authUser?.id) return;
    setSavingBuilding(true);
    try {
      const payload = {
        nombre: buildingData.nombre.trim(),
        direccion: buildingData.direccion.trim(),
        totalUnidades: Number(buildingData.totalUnidades) || 0,
        activo: true
      };
      const res = await fetch(`${API_BASE_URL}/edificios/registro/${authUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al crear edificio");
      const reload = await fetchBuildings(authUser.id);
      setBuildings(reload);
      if (reload.length > 0) setSelectedBuildingId(reload[0].idEdificio);
      setShowAddBuildingModal(false);
      alert("✅ Edificio creado");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingBuilding(false);
    }
  };

  const handleAddUnits = async (edificioId: number, units: any[]) => {
    if (!authUser?.id) return;
    setSavingUnits(true);
    try {
      const payload = units.map(u => ({
        numero: u.numero.trim(),
        torre: u.torre,
        estado: u.estado,
        activo: true
      }));
      const res = await fetch(`${API_BASE_URL}/unidades/registro-multiple/${edificioId}/${authUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al registrar unidades");
      const reload = await fetchBuildings(authUser.id);
      setBuildings(reload);
      alert("✅ Unidades registradas");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingUnits(false);
    }
  };

  const renderPage = () => {
    const userId = authUser?.id || 0;
    switch (page) {
      case "dashboard":
        return <DashboardPage
          userId={userId}
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onAddUnits={handleAddUnits}
          loadingBuildings={loadingBuildings}
          onAddBuilding={() => setShowAddBuildingModal(true)}
          transactions={transactions}
        />;
      case "residents": return <ResidentsPage userId={userId} />;
      case "payments": return <PaymentsPage userId={userId} />;
      case "finance": return <FinancePage userId={userId} />;
      case "services": return <ServicesPage userId={userId} />;
      case "reports": return <ReportsPage />;
      case "settings": return <SettingsPage dark={dark} setDark={setDark} userId={userId} />;
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
          {buildings.length > 0 && page !== "settings" && (
            <div className="px-4 lg:px-6 py-2 bg-muted/20 border-b border-border flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedBuildingId || ""}
                onChange={(e) => setSelectedBuildingId(e.target.value ? Number(e.target.value) : null)}
                className="bg-card rounded-xl px-3 py-1.5 text-sm border border-border focus:outline-none focus:border-primary"
              >
                <option value="">🌐 Todos los edificios</option>
                {buildings.map((b) => (
                  <option key={b.idEdificio} value={b.idEdificio}>
                    {b.nombre} ({b.unidades?.length || 0} unidades)
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddBuildingModal(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo edificio
              </button>
            </div>
          )}
          <main className="flex-1">{renderPage()}</main>
        </div>
      </div>

      {showAddBuildingModal && (
        <AddBuildingModal
          onClose={() => setShowAddBuildingModal(false)}
          onSave={handleAddBuilding}
          saving={savingBuilding}
        />
      )}
    </div>
  );
}