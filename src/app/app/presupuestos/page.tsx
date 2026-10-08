"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { BigLink } from "@/components/ui/BigButton";
import { StatusBadge } from "@/components/ui/Status";
import { onQuotes } from "@/lib/firebase/store";
import { calcTotals, formatUSD, DEFAULT_TAX_RATE } from "@/lib/quote";
import type { Quote } from "@/types";
import { Plus } from "lucide-react";

export default function PresupuestosPage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return onQuotes(user.uid, business.id, (data) => {
      setQuotes(data);
      setLoading(false);
    });
  }, [user, business.id]);

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Presupuestos 📄</h1>
      </header>

      {/* CTA principal */}
      <BigLink href="/app/presupuestos/nuevo" variant="accent" icon={<Plus />}>
        Nuevo presupuesto
      </BigLink>

      {loading ? (
        <p className="text-center text-muted">Cargando...</p>
      ) : quotes.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-lg font-bold">Sin presupuestos</p>
          <p className="mt-1 text-muted">
            Aún no has creado nada. ¡Haz el primero!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => {
            const totals = calcTotals(q.items, q.taxRate || DEFAULT_TAX_RATE);
            const date = q.createdAt instanceof Date ? q.createdAt : q.createdAt?.toDate?.();

            return (
              <a
                key={q.id}
                href={`/app/presupuestos/${q.id}`}
                className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm active:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">{q.clientName || "Sin nombre"}</p>
                    <p className="text-sm font-medium text-navy">#{q.quoteNumber}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
                
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm text-muted">
                    {date ? new Intl.DateTimeFormat("es-VE", {
                      day: "2-digit", month: "short", year: "numeric"
                    }).format(date) : "Reciente"}
                  </span>
                  <span className="font-extrabold text-navy text-lg">
                    {formatUSD(totals.total)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
