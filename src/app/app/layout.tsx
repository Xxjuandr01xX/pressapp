"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { getFirstBusiness, getClientSubscription } from "@/lib/firebase/store";
import type { Business, Subscription } from "@/types";
import { resolveStatus, daysLeft, canWrite } from "@/lib/subscription";
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
    ]).then(([biz, sub]) => {
      if (!biz) {
        router.replace("/onboarding");
      } else {
        setBusiness(biz);
        setSubscription(sub);
        setLoading(false);
      }
    });
  }, [user, authLoading, router]);

  if (authLoading || loading || !business) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  const status = subscription ? resolveStatus(subscription) : "blocked";
  const isLocked = !canWrite(status);
  const left = subscription ? daysLeft(subscription) : 0;
  
  const isSubscriptionPage = pathname === "/app/suscripcion";

  return (
    <AppCtx.Provider value={{ business, subscription, status }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-20">
        
        {/* Banner de Alertas */}
        {status === "trial" && left <= 4 && !isSubscriptionPage && (
          <div className="bg-accent text-navy px-4 py-2 text-center text-sm font-bold shadow-sm">
            Te quedan {left} {left === 1 ? "día" : "días"} de prueba. 
            <Link href="/app/suscripcion" className="ml-2 underline">Activar Premium</Link>
          </div>
        )}
        {status === "active" && left <= 4 && !isSubscriptionPage && (
          <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-bold shadow-sm">
            ⚠️ Tu suscripción vence en {left} {left === 1 ? "día" : "días"}. 
            <Link href="/app/suscripcion" className="ml-2 underline">Renovar ahora</Link>
          </div>
        )}
        
        {/* Contenido protegido */}
        {isLocked && !isSubscriptionPage ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
            <span className="text-5xl">🔒</span>
            <h1 className="text-xl font-extrabold text-navy">Tu acceso ha expirado</h1>
            <p className="text-muted">Para seguir creando y enviando presupuestos profesionales, reactiva tu cuenta.</p>
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
