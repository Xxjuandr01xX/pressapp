import type { Timestamp } from "firebase/firestore";

export type Trade =
  | "plomeria"
  | "electricidad"
  | "albanileria"
  | "herreria"
  | "refrigeracion"
  | "computacion"
  | "celulares"
  | "electronica"
  | "redes"
  | "sistemas"
  | "general";

export type ItemCategory = "material" | "mano_de_obra" | "servicio";

export type QuoteStatus = "borrador" | "enviado" | "aprobado" | "rechazado";

export type SubscriptionStatus =
  | "trial"
  | "trial_expired"
  | "active"
  | "grace_period"
  | "expired"
  | "blocked";

export type PaymentStatus = "pending" | "success" | "rejected";

export type DateLike = Date | Timestamp;

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  trade: Trade;
  phone: string;
  logoUrl?: string;
  address?: string;
  rifOrCedula?: string;
  razonSocial?: string;
  quotePrefix?: string;
  themeColor?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface QuoteItem {
  description: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  status: QuoteStatus;
  items: QuoteItem[];
  taxRate: number;
  exchangeRate?: number;
  currency?: "USD" | "EUR";
  notes?: string;
  createdAt: DateLike;
  sentAt?: DateLike;
  validUntil?: DateLike;
}

export interface Subscription {
  userId: string;
  status: SubscriptionStatus;
  trialStartedAt: Date;
  trialExpiresAt: Date;
  currentPeriodEnd?: Date;
  lastPaymentId?: string;
  consecutiveMonths: number;
}

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: "USDT" | "USDC";
  status: PaymentStatus;
  receiptUrl?: string;
  createdAt: DateLike;
  reviewedAt?: DateLike;
}
