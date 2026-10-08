"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "./layout";
import { BigLink } from "@/components/ui/BigButton";
import { StatusBadge } from "@/components/ui/Status";
import { onQuotes } from "@/lib/firebase/store";
import { calcTotals, formatUSD } from "@/lib/quote";
import { TRADES } from "@/lib/templates";
import type { Quote } from "@/types";
import { Plus } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (!user) return;
    return onQuotes(user.uid, business.id, setQuotes);
  }, [user, business.id]);

  const thisMonth = quotes.filter((q) => {
    const d = q.createdAt instanceof Date ? q.createdAt : q.createdAt?.toDate?.();
    if (!d) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const sent = thisMonth.filter((q) => q.status !== "borrador").length;
  const approved = thisMonth.filter((q) => q.status === "aprobado");
  const approvedTotal = approved.reduce(
    (sum, q) => sum + calcTotals(q.items, q.taxRate).total,
    0
  );

  const tradeMeta = TRADES.find((t) => t.id === business.trade);

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      {/* Saludo */}
      <header>
        <h1 className="text-2xl font-extrabold">
          Hola, {user?.displayName?.split(" ")[0] || "crack"} 👋
        </h1>
        <p className="text-muted">
          {tradeMeta?.emoji} {business.businessName}
        </p>
      </header>

      {/* CTA principal */}
      <BigLink href="/app/presupuestos/nuevo" variant="accent" icon={<Plus />}>
        Nuevo presupuesto
      </BigLink>

      {/* Resumen del mes */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase text-muted">Este mes</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-extrabold text-navy">{sent}</p>
            <p className="text-xs text-muted">📄 Enviados</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-green-600">{approved.length}</p>
            <p className="text-xs text-muted">✅ Aprobados</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-navy">{formatUSD(approvedTotal)}</p>
            <p className="text-xs text-muted">💵 Aprobado</p>
          </div>
        </div>
      </section>

      {/* Últimos presupuestos */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase text-muted">Últimos presupuestos</h2>
        {quotes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-lg font-bold">Todavía no tienes presupuestos</p>
            <p className="mt-1 text-muted">
              ¡Toca el botón amarillo de arriba para hacer el primero! ☝️
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {quotes.slice(0, 5).map((q) => (
              <a
                key={q.id}
                href={`/app/presupuestos/${q.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-slate-50"
              >
                <div>
                  <p className="font-bold">{q.clientName || "Sin nombre"}</p>
                  <p className="text-sm text-muted">#{q.quoteNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {formatUSD(calcTotals(q.items, q.taxRate).total)}
                  </span>
                  <StatusBadge status={q.status} />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
