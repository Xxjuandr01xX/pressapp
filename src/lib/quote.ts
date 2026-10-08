import type { QuoteItem } from "@/types";

export const DEFAULT_TAX_RATE = 0.16; // IVA Venezuela

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: QuoteItem): number {
  return round2(item.quantity * item.unitPriceUSD);
}

export function calcTotals(items: QuoteItem[], taxRate = DEFAULT_TAX_RATE, exchangeRate?: number) {
  const subtotal = round2(items.reduce((s, i) => s + lineTotal(i), 0));
  const tax = round2(subtotal * taxRate);
  const total = round2(subtotal + tax);
  const totalBs = exchangeRate ? round2(total * exchangeRate) : undefined;
  return { subtotal, tax, total, totalBs };
}

export function formatUSD(n: number): string {
  return `$${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatBs(n: number): string {
  return `Bs. ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Valida teléfonos móviles venezolanos: 0414, 0424, 0412, 0416, 0426 (+ 7 dígitos). */
export function isValidVePhone(phone: string): boolean {
  const d = phone.replace(/\D/g, "");
  return /^(58|0)?4(12|14|16|24|26)\d{7}$/.test(d);
}

/** Convierte a formato internacional para wa.me (58412XXXXXXX). */
export function toWhatsAppNumber(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("58")) return d;
  if (d.startsWith("0")) return `58${d.slice(1)}`;
  return `58${d}`;
}
