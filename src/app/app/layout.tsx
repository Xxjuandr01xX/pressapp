"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { getFirstBusiness, getClientSubscription } from "@/lib/firebase/store";
import type { Business, Subscription } from "@/types";
import { resolveStatus, daysLeft, canWrite, newTrial } from "@/lib/subscription";
import { createContext, useContext } from "react";
import Link from "next/link";

interface AppContext {
  business: Business;
  subscription: Subscription | null;
  status: ReturnType<typeof resolveStatus>;
}
const AppCtx = createContext<AppContext | null>(null);
export const useAppContext = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppContext debe usarse dentro del layout /app");
  return ctx;
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    Promise.all([
      getFirstBusiness(user.uid),
      getClientSubscription(user.uid)
    ]).then(async ([biz, sub]) => {
      if (!biz) {
        router.replace("/onboarding");
        return;
      }

      // Usuario nuevo sin documento de suscripción → crear sus 15 días de prueba
      if (!sub) {
        try {
          const token = await user.getIdToken();
          await fetch("/api/subscription", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
          sub = await getClientSubscription(user.uid);
        } catch (e) {
          console.error("No se pudo inicializar la prueba:", e);
        }
        // Respaldo: calcular la prueba desde la fecha de registro de la cuenta
        if (!sub) {
          const created = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
          sub = newTrial(user.uid, created);
        }
      }

      setBusiness(biz);
      setSubscription(sub);
      setLoading(false);
    });
  }, [user, authLoading, router]);

  if (authLoading || loading || !business) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  const status = subscription ? resolveStatus(subscription) : "trial";
  const isLocked = !canWrite(status);
  const left = subscription ? daysLeft(subscription) : 0;
  
  const isSubscriptionPage = pathname === "/app/suscripcion";

  return (
    <AppCtx.Provider value={{ business, subscription, status }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-20">
        
        {/* Banner de Alertas */}
        {status === "trial" && left <= 4 && !isSubscriptionPage && (
          <div className="bg-accent text-navy px-4 py-2 text-center text-sm font-bold shadow-sm">
            Te quedan {left} {left === 1 ? "día" : "días"} de prueba gratis. 
            <Link href="/app/suscripcion" className="ml-2 underline">Activar Premium (pago único)</Link>
          </div>
        )}
        {status === "active" && !subscription?.lifetime && left <= 4 && !isSubscriptionPage && (
          <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-bold shadow-sm">
            ⚠️ Tu plan vence en {left} {left === 1 ? "día" : "días"}. 
            <Link href="/app/suscripcion" className="ml-2 underline">Activar pago único</Link>
          </div>
        )}
        
        {/* Contenido protegido */}
        {isLocked && !isSubscriptionPage ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
            <span className="text-5xl">🔒</span>
            <h1 className="text-xl font-extrabold text-navy">Tu prueba gratis de 15 días terminó</h1>
            <p className="text-muted">Activa Press Premium con un único pago y úsalo para siempre, sin mensualidades.</p>
            <Link href="/app/suscripcion" className="rounded-2xl bg-navy px-6 py-3 font-bold text-white shadow-sm mt-2">
              Activar Press
            </Link>
          </div>
        ) : (
          children
        )}

      </div>
      <BottomNav />
    </AppCtx.Provider>
  );
}
