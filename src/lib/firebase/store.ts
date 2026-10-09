"use client";

import { db } from "@/lib/firebase/client";
import type { Business, Client, Quote, QuoteItem } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

// ─── Businesses ────────────────────────────────────────────
const bizCol = (uid: string) => collection(db, "users", uid, "businesses");
const bizDoc = (uid: string, bizId: string) => doc(db, "users", uid, "businesses", bizId);

export async function createBusiness(uid: string, data: Omit<Business, "id">) {
  const ref = await addDoc(bizCol(uid), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getBusiness(uid: string, bizId: string): Promise<Business | null> {
  const snap = await getDoc(bizDoc(uid, bizId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Business;
}

export async function getFirstBusiness(uid: string): Promise<Business | null> {
  const snap = await getDocs(bizCol(uid));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Business;
}

export async function updateBusiness(uid: string, bizId: string, data: Partial<Business>) {
  await updateDoc(bizDoc(uid, bizId), data);
}

// ─── Clients ───────────────────────────────────────────────
const clientCol = (uid: string, bizId: string) =>
  collection(db, "users", uid, "businesses", bizId, "clients");
const clientDoc = (uid: string, bizId: string, clientId: string) =>
  doc(db, "users", uid, "businesses", bizId, "clients", clientId);

export async function createClient(uid: string, bizId: string, data: Omit<Client, "id">) {
  const ref = await addDoc(clientCol(uid, bizId), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getClients(uid: string, bizId: string): Promise<Client[]> {
  const snap = await getDocs(query(clientCol(uid, bizId), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Client);
}

export async function updateClient(uid: string, bizId: string, clientId: string, data: Partial<Client>) {
  await updateDoc(clientDoc(uid, bizId, clientId), data);
}

export async function deleteClient(uid: string, bizId: string, clientId: string) {
  await deleteDoc(clientDoc(uid, bizId, clientId));
}

// ─── Quotes ────────────────────────────────────────────────
const quoteCol = (uid: string, bizId: string) =>
  collection(db, "users", uid, "businesses", bizId, "quotes");
const quoteDoc = (uid: string, bizId: string, quoteId: string) =>
  doc(db, "users", uid, "businesses", bizId, "quotes", quoteId);

export async function createQuote(
  uid: string,
  bizId: string,
  data: Omit<Quote, "id" | "createdAt">
) {
  const ref = await addDoc(quoteCol(uid, bizId), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getQuote(uid: string, bizId: string, quoteId: string): Promise<Quote | null> {
  const snap = await getDoc(quoteDoc(uid, bizId, quoteId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Quote;
}

export async function updateQuote(
  uid: string,
  bizId: string,
  quoteId: string,
  data: Partial<Quote>
) {
  await updateDoc(quoteDoc(uid, bizId, quoteId), data);
}

export async function deleteQuote(uid: string, bizId: string, quoteId: string) {
  await deleteDoc(quoteDoc(uid, bizId, quoteId));
}

/** Suscripción en tiempo real a los presupuestos del negocio. */
export function onQuotes(
  uid: string,
  bizId: string,
  callback: (quotes: Quote[]) => void
): Unsubscribe {
  const q = query(quoteCol(uid, bizId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quote));
  });
}

// ─── Catalog Items ─────────────────────────────────────────
const catalogCol = (uid: string, bizId: string) =>
  collection(db, "users", uid, "businesses", bizId, "catalogItems");

export interface CatalogItem extends QuoteItem {
  id: string;
}

export async function saveCatalogItem(uid: string, bizId: string, item: Omit<CatalogItem, "id">) {
  const ref = await addDoc(catalogCol(uid, bizId), item);
  return ref.id;
}

export async function getCatalogItems(uid: string, bizId: string): Promise<CatalogItem[]> {
  const snap = await getDocs(catalogCol(uid, bizId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CatalogItem);
}

export async function deleteCatalogItem(uid: string, bizId: string, itemId: string) {
  await deleteDoc(doc(db, "users", uid, "businesses", bizId, "catalogItems", itemId));
}


// ─── Subscriptions & Payments ──────────────────────────────
const subDoc = (uid: string) => doc(db, "subscriptions", uid);
const payCol = () => collection(db, "payments");

export async function getClientSubscription(uid: string) {
  const snap = await getDoc(subDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    trialStartedAt: data.trialStartedAt?.toDate(),
    trialExpiresAt: data.trialExpiresAt?.toDate(),
    currentPeriodEnd: data.currentPeriodEnd?.toDate(),
  } as any; // Matches Subscription interface
}

export async function getUserPayments(uid: string) {
  // Quitamos orderBy para no forzar al usuario a crear un índice compuesto en Firestore
  const q = query(payCol(), where("userId", "==", uid));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate()
  })) as any[];

  // Ordenamos del más reciente al más antiguo localmente
  return docs.sort((a, b) => {
    const tA = a.createdAt?.getTime() || 0;
    const tB = b.createdAt?.getTime() || 0;
    return tB - tA;
  });
}

export async function submitPayment(
  uid: string,
  email: string,
  amount: number,
  currency: "USDT" | "USDC",
  file: File
) {
  // 1. Guardar el registro en Firestore primero (sin URL por ahora)
  const docRef = await addDoc(payCol(), {
    userId: uid,
    userEmail: email,
    amount,
    currency,
    status: "pending",
    receiptUrl: "enviado-por-telegram",
    createdAt: serverTimestamp(),
  });

  // 2. Convertir la imagen a Base64 para enviarla a nuestra API
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = reader.result as string;
        
        // 3. Enviar a nuestra API que se comunicará con Telegram
        const res = await fetch("/api/webhooks/notify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: docRef.id,
            email,
            amount,
            currency,
            image: base64Image,
          }),
        });
        
        if (!res.ok) throw new Error("Error notificando a Telegram");
        resolve(docRef.id);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
  });
}
