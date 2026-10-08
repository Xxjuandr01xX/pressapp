import { describe, expect, it } from "vitest";
import { addDays, applyPayment, canWrite, daysLeft, newTrial, resolveStatus } from "./subscription";
import { calcTotals, isValidVePhone, toWhatsAppNumber } from "./quote";

const start = new Date("2026-10-01T12:00:00Z");

describe("suscripción", () => {
  it("trial dura 15 días", () => {
    const s = newTrial("u1", start);
    expect(resolveStatus(s, addDays(start, 14))).toBe("trial");
    expect(resolveStatus(s, addDays(start, 16))).toBe("trial_expired");
    expect(daysLeft(s, addDays(start, 10))).toBe(5);
  });

  it("pago da 30 días y suma al tiempo restante", () => {
    const s = newTrial("u1", start);
    const paid = applyPayment(s, "p1", addDays(start, 5)); // quedan 10 días de trial
    expect(resolveStatus(paid, addDays(start, 44))).toBe("active");
    expect(resolveStatus(paid, addDays(start, 46))).toBe("grace_period");
    expect(resolveStatus(paid, addDays(start, 50))).toBe("expired");
    expect(paid.consecutiveMonths).toBe(1);
  });

  it("permisos de escritura", () => {
    expect(canWrite("trial")).toBe(true);
    expect(canWrite("grace_period")).toBe(true);
    expect(canWrite("expired")).toBe(false);
  });
});

describe("presupuesto", () => {
  it("calcula IVA 16% y Bs", () => {
    const r = calcTotals(
      [
        { description: "Tubo", category: "material", quantity: 2, unit: "m", unitPriceUSD: 3 },
        { description: "Pegamento", category: "material", quantity: 1, unit: "und", unitPriceUSD: 2.5 },
        { description: "Mano de obra", category: "mano_de_obra", quantity: 3, unit: "h", unitPriceUSD: 8 },
      ],
      0.16,
      37.02,
    );
    expect(r).toEqual({ subtotal: 32.5, tax: 5.2, total: 37.7, totalBs: 1395.65 });
  });

  it("teléfonos venezolanos", () => {
    expect(isValidVePhone("0414-123-4567")).toBe(true);
    expect(isValidVePhone("0212-1234567")).toBe(false);
    expect(toWhatsAppNumber("0414 1234567")).toBe("584141234567");
  });
});
