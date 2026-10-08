import type { Subscription, SubscriptionStatus } from "@/types";

export const TRIAL_DAYS = 15;
export const PERIOD_DAYS = 30;
export const GRACE_DAYS = 3;
export const BLOCK_AFTER_DAYS = 90;
export const PRICE_USD = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function newTrial(userId: string, now = new Date()): Subscription {
  return {
    userId,
    status: "trial",
    trialStartedAt: now,
    trialExpiresAt: addDays(now, TRIAL_DAYS),
    consecutiveMonths: 0,
  };
}

/** Calcula el estado real de la suscripción a partir de sus fechas. */
export function resolveStatus(sub: Subscription, now = new Date()): SubscriptionStatus {
  const t = now.getTime();

  if (sub.currentPeriodEnd) {
    const end = sub.currentPeriodEnd.getTime();
    if (t < end) return "active";
    if (t < end + GRACE_DAYS * DAY_MS) return "grace_period";
    if (t < end + BLOCK_AFTER_DAYS * DAY_MS) return "expired";
    return "blocked";
  }

  const trialEnd = sub.trialExpiresAt.getTime();
  if (t < trialEnd) return "trial";
  if (t < trialEnd + BLOCK_AFTER_DAYS * DAY_MS) return "trial_expired";
  return "blocked";
}

/** Puede crear y enviar presupuestos. */
export function canWrite(status: SubscriptionStatus): boolean {
  return status === "trial" || status === "active" || status === "grace_period";
}

export function daysLeft(sub: Subscription, now = new Date()): number {
  const end = sub.currentPeriodEnd ?? sub.trialExpiresAt;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));
}

/**
 * Aplica un pago aprobado: suma 30 días desde el fin del periodo vigente
 * (si aún no venció) o desde hoy.
 */
export function applyPayment(sub: Subscription, paymentId: string, now = new Date()): Subscription {
  const currentEnd = sub.currentPeriodEnd ?? sub.trialExpiresAt;
  const base = currentEnd.getTime() > now.getTime() ? currentEnd : now;
  return {
    ...sub,
    status: "active",
    currentPeriodEnd: addDays(base, PERIOD_DAYS),
    lastPaymentId: paymentId,
    consecutiveMonths: sub.consecutiveMonths + 1,
  };
}
