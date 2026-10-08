"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { getClients } from "@/lib/firebase/store";
import type { Client } from "@/types";
import { Phone, Plus } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";

export default function ClientesPage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getClients(user.uid, business.id).then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, [user, business.id]);

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Mis Clientes 👥</h1>
      </header>

      {/* Próximamente se conectará el + Nuevo Cliente */}
      <BigButton variant="ghost" icon={<Plus size={20} />} className="text-navy">
        Añadir cliente
      </BigButton>

      {loading ? (
        <p className="text-center text-muted">Cargando...</p>
      ) : clients.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-lg font-bold">Aún no tienes clientes guardados</p>
          <p className="mt-1 text-muted">
            Tus clientes se guardarán aquí para que sea más rápido crear presupuestos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-2">
              <p className="font-bold text-lg">{c.name}</p>
              <div className="flex items-center gap-2 text-muted">
                <Phone size={16} />
                <span className="font-medium">{c.phone || "Sin número"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
