export type Pago = {
  id_pago: number;
  idResidente: number;
  titulo: string;
  monto: number;
  fecha: string;
};

const API_URL = "https://backendhacc-production.up.railway.app";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function listarPagos(idResidente?: number): Promise<Pago[]> {
  const url = idResidente
    ? `${API_URL}/pagos?idResidente=${idResidente}`
    : `${API_URL}/pagos`;
  const res = await fetch(url);
  return handle<Pago[]>(res);
}

export async function crearPago(pago: Omit<Pago, "id_pago">): Promise<void> {
  console.log("[pagosApi] crearPago ->", `${API_URL}/pagos`, pago);
  const res = await fetch(`${API_URL}/pagos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pago),
  });
  console.log("[pagosApi] crearPago status:", res.status, res.statusText);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[pagosApi] crearPago error body:", text);
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }
  return;
}

export async function eliminarPago(id_pago: number): Promise<void> {
  const res = await fetch(`${API_URL}/pagos/${id_pago}`, {
    method: "DELETE",
  });
  return handle<void>(res);
}

export async function actualizarPago(
  id_pago: number,
  pago: Omit<Pago, "id_pago">
): Promise<void> {
  const res = await fetch(`${API_URL}/pagos/${id_pago}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pago),
  });
  return handle<void>(res);
}
