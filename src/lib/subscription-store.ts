import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { applyPayment, newTrial, resolveStatus } from "@/lib/subscription";
import type { Subscription } from "@/types";

type Stored = Omit<Subscription, "trialStartedAt" | "trialExpiresAt" | "currentPeriodEnd"> & {
  trialStartedAt: Timestamp;
  trialExpiresAt: Timestamp;
  currentPeriodEnd?: Timestamp;
};

const toDomain = (s: Stored): Subscription => ({
  ...s,
  trialStartedAt: s.trialStartedAt.toDate(),
  trialExpiresAt: s.trialExpiresAt.toDate(),
  currentPeriodEnd: s.currentPeriodEnd?.toDate(),
});

const toStored = (s: Subscription) => ({
  ...s,
  trialStartedAt: Timestamp.fromDate(s.trialStartedAt),
  trialExpiresAt: Timestamp.fromDate(s.trialExpiresAt),
  ...(s.currentPeriodEnd ? { currentPeriodEnd: Timestamp.fromDate(s.currentPeriodEnd) } : {}),
});

/** Crea el trial si no existe. Devuelve la suscripción y si es nueva. */
export async function ensureSubscription(userId: string, email: string) {
  const db = adminDb();
  const ref = db.collection("subscriptions").doc(userId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return { sub: toDomain(snap.data() as Stored), created: false };
    const sub = newTrial(userId);
    tx.set(ref, toStored(sub));
    tx.set(db.collection("users").doc(userId), { email, createdAt: FieldValue.serverTimestamp(), acceptedTermsAt: FieldValue.serverTimestamp() }, { merge: true });
    return { sub, created: true };
  });
}

export async function getSubscription(userId: string) {
  const snap = await adminDb().collection("subscriptions").doc(userId).get();
  if (!snap.exists) return null;
  const sub = toDomain(snap.data() as Stored);
  return { ...sub, status: resolveStatus(sub) };
}

/** Aprueba un pago de forma idempotente y extiende la suscripción 30 días. */
export async function approvePayment(paymentId: string, reviewer: string) {
  const db = adminDb();
  const payRef = db.collection("payments").doc(paymentId);
  return db.runTransaction(async (tx) => {
    const pay = await tx.get(payRef);
    if (!pay.exists) throw new Error("Pago no existe");
    const p = pay.data()!;
    if (p.status !== "pending") return { already: true, email: p.userEmail as string };
    const subRef = db.collection("subscriptions").doc(p.userId);
    const subSnap = await tx.get(subRef);
    const current = subSnap.exists ? toDomain(subSnap.data() as Stored) : newTrial(p.userId);
    const updated = applyPayment(current, paymentId);
    tx.set(subRef, toStored(updated));
    tx.update(payRef, { status: "success", reviewedAt: FieldValue.serverTimestamp(), reviewedBy: reviewer });
    return { already: false, email: p.userEmail as string, until: updated.currentPeriodEnd! };
  });
}

export async function rejectPayment(paymentId: string, reviewer: string) {
  const ref = adminDb().collection("payments").doc(paymentId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()!.status !== "pending") return false;
  await ref.update({ status: "rejected", reviewedAt: FieldValue.serverTimestamp(), reviewedBy: reviewer });
  return true;
}
