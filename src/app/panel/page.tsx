"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { applyPayment, newTrial } from "@/lib/subscription";
import type { Subscription } from "@/types";

export default function SuperAdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  const [pending, setPending] = useState<any[]>([]);
  const [success, setSuccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  async function loadData() {
    setLoading(true);
    try {
      const qPending = query(collection(db, "payments"), where("status", "==", "pending"));
      const qSuccess = query(collection(db, "payments"), where("status", "==", "success"));
      
      const pSnap = await getDocs(qPending);
      const sSnap = await getDocs(qSuccess);
      
      setPending(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSuccess(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      console.error(e);
      setError("Error cargando datos: " + e.message);
    }
    setLoading(false);
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pin === "X1A - 2Y5") {
      setUnlocked(true);
      setError("");
      loadData();
    } else {
      setError("PIN Incorrecto");
    }
  }

  async function approve(payment: any) {
    if (!confirm(`¿Aprobar el pago de ${payment.userEmail}?`)) return;
    try {
      // 1. Marcar pago como aprobado
      await updateDoc(doc(db, "payments", payment.id), { status: "success", reviewedBy: "admin" });
      
      // 2. Obtener y actualizar suscripción
      const subRef = doc(db, "subscriptions", payment.userId);
      const subSnap = await getDoc(subRef);
      
      let currentSub: Subscription;
      if (subSnap.exists()) {
        const d = subSnap.data() as any;
        currentSub = {
          ...d,
          trialStartedAt: d.trialStartedAt.toDate(),
          trialExpiresAt: d.trialExpiresAt.toDate(),
          currentPeriodEnd: d.currentPeriodEnd?.toDate(),
        };
      } else {
        currentSub = newTrial(payment.userId);
      }
      
      const updatedSub = applyPayment(currentSub, payment.id);
      
      await setDoc(subRef, {
        ...updatedSub,
        trialStartedAt: updatedSub.trialStartedAt,
        trialExpiresAt: updatedSub.trialExpiresAt,
        currentPeriodEnd: updatedSub.currentPeriodEnd,
      });

      alert("Pago aprobado exitosamente.");
      loadData();
    } catch (e: any) {
      alert("Error al aprobar: " + e.message);
    }
  }

  async function reject(paymentId: string) {
    if (!confirm("¿Rechazar este pago?")) return;
    try {
      await updateDoc(doc(db, "payments", paymentId), { status: "rejected", reviewedBy: "admin" });
      alert("Pago rechazado.");
      loadData();
    } catch (e: any) {
      alert("Error al rechazar: " + e.message);
    }
  }

  if (authLoading) return <div className="p-10 text-center">Cargando seguridad...</div>;

  if (!unlocked) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-5">
        <form onSubmit={handleUnlock} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-navy text-center">Panel Administrativo</h1>
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          <input
            type="password"
            placeholder="Introduce el PIN"
            className="h-14 rounded-xl border-2 border-gray-200 text-center text-xl tracking-widest outline-none focus:border-navy"
            value={pin}
            onChange={e => setPin(e.target.value)}
          />
          <button type="submit" className="h-14 rounded-xl bg-navy text-white font-bold">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const ganancias = success.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <main className="min-h-dvh bg-slate-50 p-5 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-navy">Press Admin</h1>
          <div className="rounded-xl bg-green-100 px-4 py-2 text-green-800 font-bold">
            Ganancias Totales: ${ganancias.toFixed(2)} USDT
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-800">Pagos Pendientes ({pending.length})</h2>
          {loading && <p>Actualizando...</p>}
          {pending.length === 0 && !loading && <p className="text-gray-500">No hay pagos pendientes.</p>}
          
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map(p => (
              <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm border border-yellow-200">
                <p className="font-bold text-lg">{p.userEmail}</p>
                <p className="text-gray-500">Monto: {p.amount} {p.currency}</p>
                <p className="text-xs text-gray-400 font-mono mt-1 mb-4">ID: {p.id}</p>
                
                <div className="flex gap-2">
                  <button onClick={() => approve(p)} className="flex-1 rounded-lg bg-green-600 py-2 font-bold text-white">
                    Aprobar
                  </button>
                  <button onClick={() => reject(p.id)} className="flex-1 rounded-lg bg-red-100 py-2 font-bold text-red-600">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-800">Pagos Aprobados Recientes</h2>
          <div className="space-y-2">
            {success.slice(0, 10).map(p => (
              <div key={p.id} className="flex justify-between rounded-lg bg-white p-4 shadow-sm">
                <span className="font-semibold">{p.userEmail}</span>
                <span className="text-green-600 font-bold">+${p.amount} USDT</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
