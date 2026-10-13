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
  // Pago único → Premium de por vida
  if (sub.lifetime) return "active";

  const t = now.getTime();

  // Compatibilidad con pagos mensuales antiguos
  if (sub.currentPeriodEnd) {
    const end = sub.currentPeriodEnd.getTime();
    if (t < end) return "active";
    if (t < end + GRACE_DAYS * DAY_MS) return "grace_period";
    return "expired";
  }

  const trialEnd = sub.trialExpiresAt.getTime();
  if (t < trialEnd) return "trial";
  return "trial_expired";
}

/** Puede crear y enviar presupuestos (solo durante los 15 días o siendo Premium). */
export function canWrite(status: SubscriptionStatus): boolean {
  return status === "trial" || status === "active" || status === "grace_period";
}

/** Es Premium (funcionalidad completa). */
export function isPremium(sub: Subscription | null, now = new Date()): boolean {
  return !!sub && resolveStatus(sub, now) === "active";
}

export function daysLeft(sub: Subscription, now = new Date()): number {
  if (sub.lifetime) return Infinity;
  const end = sub.currentPeriodEnd ?? sub.trialExpiresAt;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));
}

/** Aplica el pago único aprobado: activa Premium de por vida. */
export function applyPayment(sub: Subscription, paymentId: string): Subscription {
  return {
    ...sub,
    status: "active",
    lifetime: true,
    lastPaymentId: paymentId,
    consecutiveMonths: sub.consecutiveMonths + 1,
  };
}
