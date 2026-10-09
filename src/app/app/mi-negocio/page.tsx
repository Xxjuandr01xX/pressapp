"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { BigButton } from "@/components/ui/BigButton";
import { auth } from "@/lib/firebase/client";
import { updateBusiness, getUserPayments } from "@/lib/firebase/store";
import { TRADES } from "@/lib/templates";
import { LogOut, Save } from "lucide-react";

export default function MiNegocioPage() {
  const { user } = useAuth();
  const { business, status } = useAppContext();
  const router = useRouter();

  const [name, setName] = useState(business.businessName);
  const [phone, setPhone] = useState(business.phone);
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserPayments(user.uid).then(setPayments);
    }
  }, [user]);

  const tradeMeta = TRADES.find((t) => t.id === business.trade);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateBusiness(user.uid, business.id, {
        businessName: name.trim() || business.businessName,
        phone: phone.trim() || business.phone,
      });
      // El cambio tomará efecto al recargar (el context lo trae del init)
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  async function handleLogout() {
    await auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">Mi Negocio 🧰</h1>
        <p className="text-muted text-sm mt-1">Configura los datos que ven tus clientes</p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <label className="text-xs font-bold uppercase text-muted">Oficio (No se puede cambiar)</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-xl">{tradeMeta?.emoji}</span>
            <span className="font-bold text-slate-500">{tradeMeta?.label}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">Nombre del Negocio</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-navy"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">WhatsApp de contacto</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-navy"
          />
        </div>

        <BigButton onClick={handleSave} disabled={saving || (name === business.businessName && phone === business.phone)}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </BigButton>
      </section>

      {/* Suscripción e Historial */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-navy/10 bg-navy/5 p-5">
          <h2 className="text-sm font-bold uppercase text-navy">Mi Suscripción</h2>
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {status === "active" ? "Plan Premium" : "Plan Trial (15 días)"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {status === "active" ? "ACTIVO" : "DE PRUEBA"}
            </span>
          </div>
          
          <Link href="/app/suscripcion" className="mt-2 block w-full rounded-xl bg-navy py-3 text-center font-bold text-white shadow-sm active:scale-95 transition-transform">
            {status === "active" ? "Extender Suscripción" : "Pagar Suscripción"}
          </Link>
        </div>

        {/* Historial de pagos */}
        {payments.length > 0 && (
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase text-muted">Historial de pagos</h3>
            <div className="flex flex-col gap-3">
              {payments.map(p => (
                <div key={p.id} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-navy">{p.amount} {p.currency}</span>
                    <span className="text-xs text-muted">
                      {p.createdAt ? new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", year: "numeric" }).format(p.createdAt) : "Reciente"}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${p.status === "success" ? "text-green-600" : p.status === "rejected" ? "text-red-500" : "text-yellow-600"}`}>
                    {p.status === "success" ? "Aprobado" : p.status === "rejected" ? "Rechazado" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-2 py-4 font-bold text-red-500 active:opacity-70"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </main>
  );
}
