"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { onQuotes } from "@/lib/firebase/store";
import type { Quote } from "@/types";
import { Phone, Users } from "lucide-react";

export default function ClientesPage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = onQuotes(user.uid, business.id, (data) => {
      setQuotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user, business.id]);

  // Extraer clientes únicos
  const clientsMap = new Map<string, { name: string; phone: string; count: number }>();
  
  quotes.forEach(q => {
    const key = (q.clientName + q.clientPhone).toLowerCase().trim();
    if (clientsMap.has(key)) {
      clientsMap.get(key)!.count++;
    } else {
      clientsMap.set(key, { name: q.clientName, phone: q.clientPhone || "", count: 1 });
    }
  });

  const clients = Array.from(clientsMap.values()).sort((a, b) => b.count - a.count);

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Mis Clientes</h1>
      </header>

      {loading ? (
        <p className="text-center text-muted">Buscando clientes...</p>
      ) : clients.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
          <Users size={48} className="text-slate-300" />
          <p className="text-lg font-bold text-navy">Aún no tienes clientes</p>
          <p className="text-sm text-muted">
            Los clientes se guardarán aquí automáticamente a medida que vayas creando presupuestos para ellos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start">
                <p className="font-bold text-lg text-ink">{c.name}</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                  {c.count} {c.count === 1 ? "presupuesto" : "presupuestos"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Phone size={16} />
                <span className="font-medium text-sm">{c.phone || "Sin número registrado"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
