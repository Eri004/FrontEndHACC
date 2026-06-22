import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthContext";
import { confirmarPago, type PayPhoneConfirmResponse, formatUsd, centsToUsd } from "./payphoneApi";
import { crearPago } from "./pagosApi";

type Status = "loading" | "approved" | "rejected" | "error";

export default function PagoResultado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [resp, setResp] = useState<PayPhoneConfirmResponse | null>(null);

  useEffect(() => {
    const procesar = async () => {
      const idStr = searchParams.get("id");
      const clientTxId = searchParams.get("clientTransactionId");

      if (!idStr || !clientTxId) {
        setStatus("error");
        setMessage("Faltan parámetros en la URL de respuesta de PayPhone.");
        return;
      }

      const id = Number(idStr);
      if (!id || !user?.id) {
        setStatus("error");
        setMessage("No se pudo identificar la transacción o el residente.");
        return;
      }

      const pendingStr = localStorage.getItem("pago_pendiente");
      if (!pendingStr) {
        setStatus("error");
        setMessage("No se encontró la información del pago pendiente.");
        return;
      }

      let pending: { titulo: string; monto: number; fecha: string };
      try {
        pending = JSON.parse(pendingStr);
      } catch {
        setStatus("error");
        setMessage("Información del pago corrupta.");
        return;
      }

      try {
        const r = await confirmarPago(id, clientTxId);
        setResp(r);

        if (r.statusCode === 3) {
          try {
            await crearPago({
              idResidente: user.id,
              titulo: pending.titulo,
              monto: centsToUsd(r.amount),
              fecha: pending.fecha,
            });
            localStorage.removeItem("pago_pendiente");
            setStatus("approved");
            setMessage("Pago confirmado y registrado correctamente.");
          } catch (err) {
            console.error("Error guardando pago en backend:", err);
            setStatus("error");
            setMessage("El pago fue aprobado por PayPhone, pero no se pudo guardar en el sistema. Contacta al administrador.");
          }
        } else if (r.statusCode === 2) {
          setStatus("rejected");
          setMessage("La transacción fue cancelada.");
        } else {
          setStatus("rejected");
          setMessage(r.message || "La transacción no fue aprobada.");
        }
      } catch (err: any) {
        console.error("Error confirmando pago:", err);
        setStatus("error");
        setMessage(`No se pudo confirmar la transacción: ${err?.message ?? "error desconocido"}`);
      }
    };

    procesar();
  }, [searchParams, user]);

  const volver = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Procesando pago</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Estamos confirmando tu transacción con PayPhone...
              </p>
            </>
          )}

          {status === "approved" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">¡Pago aprobado!</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{message}</p>
              {resp && (
                <div className="mt-6 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-left text-sm space-y-2">
                  <Row label="Concepto" value={resp.reference} />
                  <Row label="Monto" value={formatUsd(centsToUsd(resp.amount))} />
                  <Row label="Autorización" value={resp.authorizationCode} />
                  <Row label="Tarjeta" value={`${resp.cardBrand} ****${resp.lastDigits}`} />
                  <Row label="Fecha" value={new Date(resp.date).toLocaleString("es-CO")} />
                </div>
              )}
            </>
          )}

          {status === "rejected" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-400">Pago no completado</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </>
          )}

          {status !== "loading" && (
            <button
              onClick={volver}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-semibold text-slate-900 dark:text-white text-right truncate">{value}</span>
    </div>
  );
}
