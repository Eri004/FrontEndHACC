import { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Clock,
  Zap,
  User,
  Bell,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Droplets,
  Lightbulb,
  Wrench,
  Sun,
  Moon,
  Search,
  Building2,
  LogOut,
  Calendar,
  Wifi,
  Shield,
  Settings,
  Phone,
  Mail,
  Edit2,
  FileText,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

type Page = "dashboard" | "payments" | "register" | "history" | "services" | "profile";
type Status = "paid" | "overdue" | "pending";

// ─── data ────────────────────────────────────────────────────────────────────

const PENDING_PAYMENTS = [
  { id: 1, concept: "Alícuota de administración", amount: 180_000, due: "2026-06-15", status: "pending" as Status },
  { id: 2, concept: "Servicio de agua — Mayo", amount: 45_000, due: "2026-06-10", status: "overdue" as Status },
  { id: 3, concept: "Cuota extraordinaria — Pintura", amount: 250_000, due: "2026-06-30", status: "pending" as Status },
];

const HISTORY_ITEMS = [
  { id: 1, concept: "Alícuota — Junio 2026", amount: 180_000, date: "2026-06-01", status: "paid" as Status, cat: "Administración" },
  { id: 2, concept: "Agua — Mayo 2026", amount: 45_000, date: "2026-05-28", status: "overdue" as Status, cat: "Servicios" },
  { id: 3, concept: "Luz — Mayo 2026", amount: 62_000, date: "2026-05-15", status: "paid" as Status, cat: "Servicios" },
  { id: 4, concept: "Alícuota — Mayo 2026", amount: 180_000, date: "2026-05-01", status: "paid" as Status, cat: "Administración" },
  { id: 5, concept: "Mantenimiento ascensor", amount: 350_000, date: "2026-04-20", status: "paid" as Status, cat: "Mantenimiento" },
  { id: 6, concept: "Agua — Abril 2026", amount: 41_000, date: "2026-04-15", status: "paid" as Status, cat: "Servicios" },
  { id: 7, concept: "Gas — Abril 2026", amount: 28_000, date: "2026-04-12", status: "paid" as Status, cat: "Servicios" },
  { id: 8, concept: "Alícuota — Abril 2026", amount: 180_000, date: "2026-04-01", status: "paid" as Status, cat: "Administración" },
];

const SERVICES_LIST = [
  { id: 1, name: "Agua", status: "active", reading: "142 m³", due: "2026-06-15", icon: "droplets", colorClass: "text-blue-500 bg-blue-50 dark:bg-blue-900/40" },
  { id: 2, name: "Electricidad", status: "active", reading: "385 kWh", due: "2026-06-20", icon: "lightbulb", colorClass: "text-amber-500 bg-amber-50 dark:bg-amber-900/40" },
  { id: 3, name: "Gas", status: "active", reading: "12.4 m³", due: "2026-06-18", icon: "zap", colorClass: "text-orange-500 bg-orange-50 dark:bg-orange-900/40" },
  { id: 4, name: "Internet", status: "active", reading: "100 Mbps", due: "2026-06-01", icon: "wifi", colorClass: "text-purple-500 bg-purple-50 dark:bg-purple-900/40" },
  { id: 5, name: "Seguridad 24/7", status: "active", reading: "Operativo", due: "2026-07-01", icon: "shield", colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40" },
  { id: 6, name: "Mantenimiento", status: "scheduled", reading: "Programado", due: "2026-06-25", icon: "wrench", colorClass: "text-slate-500 bg-slate-100 dark:bg-slate-700/40" },
];

const NOTIFICATIONS = [
  { id: 1, text: "Tu pago de agua está vencido hace 2 días", time: "Hace 2 horas", type: "warning" },
  { id: 2, text: "Asamblea de copropietarios el 20 de junio a las 7 PM", time: "Ayer", type: "info" },
  { id: 3, text: "Pago de alícuota confirmado exitosamente", time: "Hace 3 días", type: "success" },
  { id: 4, text: "Mantenimiento de ascensor programado para el 25 de junio", time: "Hace 4 días", type: "info" },
];

const CATEGORIES = ["Administración", "Servicios", "Mantenimiento", "Otros"];

// ─── helpers ─────────────────────────────────────────────────────────────────

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const fdate = (d: string) =>
  new Date(d + "T00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" });

function SvcIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className ?? "w-5 h-5";
  switch (icon) {
    case "droplets": return <Droplets className={cls} />;
    case "lightbulb": return <Lightbulb className={cls} />;
    case "zap": return <Zap className={cls} />;
    case "wifi": return <Wifi className={cls} />;
    case "shield": return <Shield className={cls} />;
    default: return <Wrench className={cls} />;
  }
}

// ─── nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard" as Page, label: "Inicio", Icon: LayoutDashboard },
  { id: "payments" as Page, label: "Pagos", Icon: CreditCard },
  { id: "register" as Page, label: "Registrar", Icon: Plus },
  { id: "history" as Page, label: "Historial", Icon: Clock },
  { id: "services" as Page, label: "Servicios", Icon: Zap },
  { id: "profile" as Page, label: "Perfil", Icon: User },
];

// ─── badge ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status | string }) {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />
        Pagado
      </span>
    );
  if (status === "overdue")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
        <AlertTriangle className="w-3 h-3" />
        Vencido
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
      <Clock className="w-3 h-3" />
      Pendiente
    </span>
  );
}

// ─── sidebar (desktop) ────────────────────────────────────────────────────────

function Sidebar({
  page,
  setPage,
  dark,
  setDark,
}: {
  page: Page;
  setPage: (p: Page) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full bg-card border-r border-border">
      {/* logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">El Parque</p>
          <p className="text-xs text-muted-foreground">Admin Suite</p>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              page === id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* bottom actions */}
      <div className="px-3 pb-4 pt-4 space-y-0.5 border-t border-border">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Modo claro" : "Modo oscuro"}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

// ─── bottom nav (mobile) ──────────────────────────────────────────────────────

function BottomNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex-1 flex flex-col items-center justify-end gap-0.5 py-2 transition-all duration-150 relative ${
              page === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {id === "register" ? (
              <>
                <span className="absolute -top-5 w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </span>
                <span className="mt-6 text-[10px] font-medium opacity-0">·</span>
              </>
            ) : (
              <>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: string;
  sub: string;
  colorClass: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-extrabold mt-1.5 ${colorClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

// ─── dashboard page ───────────────────────────────────────────────────────────

function DashboardPage({
  setPage,
  dark,
  setDark,
}: {
  setPage: (p: Page) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}) {
  const totalPending = PENDING_PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      {/* header */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Bienvenido de vuelta</p>
          <h1 className="text-xl font-extrabold text-foreground mt-0.5">Carlos Mendoza</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Apto 304 · Torre B · El Parque</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="lg:hidden w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="relative w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
          </button>
        </div>
      </div>

      {/* hero balance card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-5 text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute right-4 bottom-0 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Total por pagar</p>
          <p className="text-4xl font-extrabold mt-1.5 tracking-tight">{cop(totalPending)}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <p className="text-blue-200 text-xs">{PENDING_PAYMENTS.length} obligaciones activas</p>
            </div>
            <button
              onClick={() => setPage("payments")}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-all backdrop-blur-sm border border-white/10"
            >
              Ver pagos →
            </button>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pagados" value="2" sub="este mes" colorClass="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Vencidos" value="1" sub="Agua - Mayo" colorClass="text-red-600 dark:text-red-400" />
        <StatCard label="Residentes" value="48" sub="Torre A y B" colorClass="text-blue-600 dark:text-blue-400" />
        <StatCard label="Servicios" value="6" sub="activos" colorClass="text-purple-600 dark:text-purple-400" />
      </div>

      {/* quick actions */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Agua", Icon: Droplets, cls: "text-blue-500 bg-blue-50 dark:bg-blue-900/40" },
            { label: "Luz", Icon: Lightbulb, cls: "text-amber-500 bg-amber-50 dark:bg-amber-900/40" },
            { label: "Gas", Icon: Zap, cls: "text-orange-500 bg-orange-50 dark:bg-orange-900/40" },
            { label: "Servicios", Icon: Wrench, cls: "text-purple-500 bg-purple-50 dark:bg-purple-900/40" },
          ].map(({ label, Icon, cls }) => (
            <button
              key={label}
              onClick={() => setPage("services")}
              className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-150 group"
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls} group-hover:scale-110 transition-transform duration-150`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* pending payments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pagos pendientes</h2>
          <button
            onClick={() => setPage("payments")}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos →
          </button>
        </div>
        <div className="space-y-2">
          {PENDING_PAYMENTS.map((p) => (
            <div
              key={p.id}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-all"
            >
              <div className={`w-2 h-10 rounded-full shrink-0 ${p.status === "overdue" ? "bg-red-500" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.concept}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted-foreground">Vence {fdate(p.due)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{cop(p.amount)}</p>
                <button
                  onClick={() => setPage("payments")}
                  className="mt-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Pagar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* notifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notificaciones</h2>
          <span className="text-xs text-muted-foreground">{NOTIFICATIONS.length} nuevas</span>
        </div>
        <div className="space-y-2">
          {NOTIFICATIONS.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="bg-card rounded-2xl border border-border p-3.5 flex items-start gap-3"
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === "warning"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    : n.type === "success"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                }`}
              >
                {n.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : n.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── payments page ────────────────────────────────────────────────────────────

function PaymentsPage() {
  const [paidIds, setPaidIds] = useState<number[]>([]);

  const handlePay = (id: number) =>
    setPaidIds((prev) => [...prev, id]);

  const overdueTotal = PENDING_PAYMENTS.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const pendingTotal = PENDING_PAYMENTS.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Mis Pagos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestiona tus obligaciones</p>
      </div>

      {/* summary chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-sm">
          <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Vencido</p>
          <p className="text-lg font-extrabold mt-1">{cop(overdueTotal)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-4 text-white shadow-sm">
          <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Pendiente</p>
          <p className="text-lg font-extrabold mt-1">{cop(pendingTotal)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-sm">
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Pagado</p>
          <p className="text-lg font-extrabold mt-1">{cop(242_000)}</p>
        </div>
      </div>

      {/* list */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Obligaciones actuales</h2>
        <div className="space-y-3">
          {PENDING_PAYMENTS.map((p) => {
            const isPaid = paidIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`bg-card rounded-2xl border transition-all duration-300 p-4 ${
                  isPaid ? "border-emerald-200 dark:border-emerald-800" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{p.concept}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Vence el {fdate(p.due)}</p>
                    <div className="mt-2">
                      <StatusBadge status={isPaid ? "paid" : p.status} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-extrabold text-foreground">{cop(p.amount)}</p>
                  </div>
                </div>
                {!isPaid ? (
                  <button
                    onClick={() => handlePay(p.id)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary/20"
                  >
                    Pagar ahora
                  </button>
                ) : (
                  <div className="mt-3 w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Pago procesado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* pay all */}
      <button className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
        Pagar todo — {cop(PENDING_PAYMENTS.reduce((s, p) => s + p.amount, 0))}
      </button>

      {/* recent paid section */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Pagos recientes</h2>
        <div className="space-y-2">
          {HISTORY_ITEMS.filter((h) => h.status === "paid")
            .slice(0, 3)
            .map((h) => (
              <div key={h.id} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.concept}</p>
                    <p className="text-xs text-muted-foreground">{fdate(h.date)}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{cop(h.amount)}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── register page ────────────────────────────────────────────────────────────

function RegisterPage() {
  const [form, setForm] = useState({ amount: "", description: "", date: "2026-06-12", category: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.amount && form.description && form.category;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ amount: "", description: "", date: "2026-06-12", category: "", notes: "" });
    }, 2800);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Registrar Gasto</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Añade un nuevo gasto al historial</p>
      </div>

      {submitted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            Gasto registrado exitosamente
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
        {/* amount — prominent */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Monto (COP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-muted-foreground">
              $
            </span>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-muted/50 rounded-xl text-foreground text-2xl font-extrabold placeholder:text-muted-foreground/50 border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* description */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Descripción
          </label>
          <input
            type="text"
            placeholder="Ej. Pintura de pasillos Torre A"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground/60 border border-transparent focus:border-primary focus:outline-none transition-all"
          />
        </div>

        {/* date */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl text-foreground border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* category */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => set("category", c)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  form.category === c
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* notes */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Notas{" "}
            <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            placeholder="Información adicional, proveedor, factura..."
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground/60 border border-transparent focus:border-primary focus:outline-none transition-all resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
      >
        Registrar gasto
      </button>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── history page ─────────────────────────────────────────────────────────────

function HistoryPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const cats = ["Todas", "Administración", "Servicios", "Mantenimiento"];
  const statuses = ["Todos", "Pagado", "Pendiente", "Vencido"];

  const filtered = HISTORY_ITEMS.filter((h) => {
    const matchSearch = h.concept.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todas" || h.cat === catFilter;
    const matchStatus =
      statusFilter === "Todos" ||
      (statusFilter === "Pagado" && h.status === "paid") ||
      (statusFilter === "Pendiente" && h.status === "pending") ||
      (statusFilter === "Vencido" && h.status === "overdue");
    return matchSearch && matchCat && matchStatus;
  });

  const total = filtered.reduce((s, h) => s + h.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Historial</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Todos tus movimientos</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
          <FileText className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar concepto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* filters */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                catFilter === c
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                statusFilter === s
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* results summary */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
        <p className="text-xs font-bold text-foreground">Total: {cop(total)}</p>
      </div>

      {/* desktop table */}
      <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Concepto</th>
              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoría</th>
              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha</th>
              <th className="text-right px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monto</th>
              <th className="text-center px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((h) => (
              <tr key={h.id} className="hover:bg-muted/20 transition-colors duration-100">
                <td className="px-5 py-4 font-semibold text-foreground">{h.concept}</td>
                <td className="px-5 py-4 text-muted-foreground">{h.cat}</td>
                <td className="px-5 py-4 text-muted-foreground">{fdate(h.date)}</td>
                <td className="px-5 py-4 text-right font-bold text-foreground">{cop(h.amount)}</td>
                <td className="px-5 py-4 text-center">
                  <StatusBadge status={h.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Sin resultados para esta búsqueda
          </div>
        )}
      </div>

      {/* mobile list */}
      <div className="lg:hidden space-y-2">
        {filtered.map((h) => (
          <div key={h.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{h.concept}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{fdate(h.date)}</span>
                <span className="text-muted-foreground/40">·</span>
                <StatusBadge status={h.status} />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground shrink-0">{cop(h.amount)}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">Sin resultados</div>
        )}
      </div>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── services page ────────────────────────────────────────────────────────────

function ServicesPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Servicios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Estado de los servicios del conjunto</p>
      </div>

      {/* status banner */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white shadow-sm shadow-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-lg leading-tight">Todos los servicios operativos</p>
            <p className="text-emerald-100 text-sm mt-0.5">5 activos · 1 programado · última revisión hoy</p>
          </div>
        </div>
      </div>

      {/* services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICES_LIST.map((s) => (
          <div
            key={s.id}
            className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-all duration-150 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.colorClass} group-hover:scale-110 transition-transform duration-150`}>
                <SvcIcon icon={s.icon} className="w-5 h-5" />
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  s.status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                }`}
              >
                {s.status === "active" ? "Activo" : "Programado"}
              </span>
            </div>
            <h3 className="font-bold text-foreground">{s.name}</h3>
            <p className="text-muted-foreground text-sm mt-0.5 font-medium">{s.reading}</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Vencimiento</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{fdate(s.due)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* support card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">¿Necesitas soporte técnico?</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Reporta fallas o solicita revisión de cualquier servicio del conjunto.
            </p>
          </div>
        </div>
        <button className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          Solicitar soporte
        </button>
      </div>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── profile page ─────────────────────────────────────────────────────────────

function ProfilePage({ dark, setDark }: { dark: boolean; setDark: (d: boolean) => void }) {
  const [notifsPush, setNotifsPush] = useState(true);
  const [autoDebit, setAutoDebit] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tu información y configuración</p>
      </div>

      {/* profile card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
            CM
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-foreground">Carlos Mendoza</h2>
            <p className="text-sm text-muted-foreground">Apto 304 · Torre B</p>
            <p className="text-xs text-muted-foreground mt-0.5">Conjunto Residencial El Parque</p>
          </div>
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Correo</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">c.mendoza@email.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Teléfono</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">+57 320 456 7890</p>
            </div>
          </div>
        </div>
      </div>

      {/* preferences */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preferencias</p>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              label: "Notificaciones push",
              Icon: Bell,
              value: notifsPush,
              toggle: () => setNotifsPush((v) => !v),
            },
            {
              label: "Débito automático",
              Icon: CreditCard,
              value: autoDebit,
              toggle: () => setAutoDebit((v) => !v),
            },
            {
              label: "Modo oscuro",
              Icon: dark ? Sun : Moon,
              value: dark,
              toggle: () => setDark(!dark),
            },
          ].map(({ label, Icon, value, toggle }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{label}</span>
              </div>
              <button
                onClick={toggle}
                className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                  value ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    value ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* account */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cuenta</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Cambiar contraseña", Icon: Settings },
            { label: "Términos y condiciones", Icon: FileText },
            { label: "Política de privacidad", Icon: Shield },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* stats summary */}
      <div className="bg-card rounded-2xl border border-border p-4 grid grid-cols-3 divide-x divide-border">
        <div className="text-center px-3">
          <p className="text-xl font-extrabold text-foreground">24</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">Pagos</p>
        </div>
        <div className="text-center px-3">
          <p className="text-xl font-extrabold text-foreground">8</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">Meses</p>
        </div>
        <div className="text-center px-3">
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">98%</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">Al día</p>
        </div>
      </div>

      {/* logout */}
      <button className="w-full py-3.5 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/50 transition-all flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      <div className="h-6 lg:hidden" />
    </div>
  );
}

// ─── app shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} dark={dark} setDark={setDark} />;
      case "payments":
        return <PaymentsPage />;
      case "register":
        return <RegisterPage />;
      case "history":
        return <HistoryPage />;
      case "services":
        return <ServicesPage />;
      case "profile":
        return <ProfilePage dark={dark} setDark={setDark} />;
    }
  };

  return (
    <div className={dark ? "dark" : ""} style={{ width: "100%", height: "100%" }}>
      <div className="size-full flex bg-background overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ scrollbarWidth: "none" }}>
          {renderPage()}
        </main>

        <BottomNav page={page} setPage={setPage} />
      </div>
    </div>
  );
}
