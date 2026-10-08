"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BigButton } from "@/components/ui/BigButton";
import { TRADES } from "@/lib/templates";
import { isValidVePhone } from "@/lib/quote";
import { createBusiness } from "@/lib/firebase/store";
import type { Trade } from "@/types";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [trade, setTrade] = useState<Trade | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saving, setSaving] = useState(false);

  const progress = (step / 4) * 100;

  async function handleFinish() {
    if (!user || !trade) return;
    setSaving(true);
    try {
      await createBusiness(user.uid, {
        userId: user.uid,
        businessName: businessName.trim() || `Mi negocio`,
        trade,
        phone: phone.replace(/\D/g, ""),
      });
      router.replace("/app");
    } catch (e) {
      console.error("Error al guardar negocio:", e);
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      {/* Barra de progreso */}
      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-navy transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ─── Paso 1: Oficio ─── */}
      {step === 1 && (
        <section className="flex flex-1 flex-col gap-6">
          <h1 className="text-2xl font-extrabold">¿A qué te dedicas? 🔨</h1>
          <p className="text-muted">
            Esto nos ayuda a mostrarte plantillas de presupuesto para tu oficio.
          </p>
          <div className="grid gap-3">
            {TRADES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTrade(t.id);
                  setStep(2);
                }}
                className={`flex min-h-14 items-center gap-4 rounded-2xl border-2 px-5 text-lg font-bold transition active:scale-[0.98] ${
                  trade === t.id
                    ? "border-navy bg-navy/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Paso 2: Nombre del negocio ─── */}
      {step === 2 && (
        <section className="flex flex-1 flex-col gap-6">
          <h1 className="text-2xl font-extrabold">¿Cómo se llama tu negocio? 🏪</h1>
          <p className="text-muted">
            Este nombre aparecerá en tus presupuestos. Si no tienes nombre, pon tu nombre personal.
          </p>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={`Ej: ${user?.displayName || "José"} ${TRADES.find((t) => t.id === trade)?.label || "Servicios"}`}
            className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg outline-none focus:border-navy"
            autoFocus
          />
          <div className="mt-auto flex gap-3">
            <BigButton variant="ghost" onClick={() => setStep(1)}>
              ← Atrás
            </BigButton>
            <BigButton onClick={() => setStep(3)}>
              Siguiente →
            </BigButton>
          </div>
        </section>
      )}

      {/* ─── Paso 3: WhatsApp ─── */}
      {step === 3 && (
        <section className="flex flex-1 flex-col gap-6">
          <h1 className="text-2xl font-extrabold">¿Tu número de WhatsApp? 📱</h1>
          <p className="text-muted">
            Para que tus clientes puedan contactarte desde el presupuesto.
          </p>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError("");
            }}
            placeholder="0414-1234567"
            className={`w-full rounded-2xl border-2 px-5 py-4 text-lg outline-none ${
              phoneError ? "border-red-400" : "border-slate-200 focus:border-navy"
            }`}
            autoFocus
          />
          {phoneError && (
            <p className="text-sm font-medium text-red-500">{phoneError}</p>
          )}
          <div className="mt-auto flex gap-3">
            <BigButton variant="ghost" onClick={() => setStep(2)}>
              ← Atrás
            </BigButton>
            <BigButton
              onClick={() => {
                if (!isValidVePhone(phone)) {
                  setPhoneError("Coloca un número válido (ej: 0414-1234567)");
                  return;
                }
                setStep(4);
              }}
            >
              Siguiente →
            </BigButton>
          </div>
        </section>
      )}

      {/* ─── Paso 4: Confirmación ─── */}
      {step === 4 && (
        <section className="flex flex-1 flex-col gap-6">
          <h1 className="text-2xl font-extrabold">¡Todo listo! 🎉</h1>
          <p className="text-muted">
            Revisa los datos de tu negocio. Luego podrás cambiarlos cuando quieras.
          </p>

          <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <span className="text-sm text-muted">Oficio</span>
              <p className="text-lg font-bold">
                {TRADES.find((t) => t.id === trade)?.emoji}{" "}
                {TRADES.find((t) => t.id === trade)?.label}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted">Negocio</span>
              <p className="text-lg font-bold">
                {businessName || `Mi negocio`}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted">WhatsApp</span>
              <p className="text-lg font-bold">{phone}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <BigButton onClick={handleFinish} disabled={saving}>
              {saving ? "Guardando..." : "🚀 ¡Hagamos mi primer presupuesto!"}
            </BigButton>
            <BigButton variant="ghost" onClick={() => setStep(3)}>
              ← Corregir algo
            </BigButton>
          </div>
        </section>
      )}
    </main>
  );
}
