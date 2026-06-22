export type PayPhoneConfig = {
  token: string;
  storeId: string;
  currency: string;
};

export function getPayPhoneConfig(): PayPhoneConfig {
  const token = import.meta.env.VITE_PAYPHONE_TOKEN ?? "";
  const storeId = import.meta.env.VITE_PAYPHONE_STOREID ?? "";
  return {
    token,
    storeId,
    currency: "USD",
  };
}

export function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

export function centsToUsd(cents: number): number {
  return cents / 100;
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export type PayPhoneConfirmResponse = {
  email: string;
  cardType: string;
  bin: string;
  lastDigits: string;
  deferredCode: string;
  deferred: boolean;
  cardBrandCode: string;
  cardBrand: string;
  amount: number;
  clientTransactionId: string;
  phoneNumber: string;
  statusCode: number;
  transactionStatus: string;
  authorizationCode: string;
  message: string | null;
  messageCode: number;
  transactionId: number;
  document: string;
  currency: string;
  optionalParameter3: string | null;
  optionalParameter4: string | null;
  storeName: string;
  date: string;
  regionIso: string;
  transactionType: string;
  reference: string;
};

const CONFIRM_URL = "https://paymentbox.payphonetodoesposible.com/api/confirm";

export async function confirmarPago(
  id: number,
  clientTxId: string
): Promise<PayPhoneConfirmResponse> {
  const { token } = getPayPhoneConfig();
  const res = await fetch(CONFIRM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, clientTxId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export function generarClientTransactionId(): string {
  return `HACC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

declare global {
  interface Window {
    PPaymentButtonBox: new (config: Record<string, unknown>) => {
      render: (containerId: string) => void;
    };
  }
}
