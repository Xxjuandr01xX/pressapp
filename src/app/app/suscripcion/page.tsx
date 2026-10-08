"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { BigButton } from "@/components/ui/BigButton";
import { submitPayment } from "@/lib/firebase/store";
import { PRICE_USD } from "@/lib/subscription";
import { CheckCircle, Copy, Upload, Clock } from "lucide-react";

export default function SuscripcionPage() {
  const { user } = useAuth();
  const { status } = useAppContext();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const binanceId = process.env.NEXT_PUBLIC_BINANCE_PAY_ID || "No configurado";

  function handleCopy() {
    navigator.clipboard.writeText(binanceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit() {
    if (!user || !file) return;
    setSaving(true);
    try {
      await submitPayment(
        user.uid,
        user.email || "Sin correo",
        PRICE_USD,
        "USDT",
        file
      );
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Error al subir el comprobante. Intenta de nuevo.");
      setSaving(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="text-6xl text-green-500">
          <Clock size={64} />
        </span>
        <h1 className="text-2xl font-extrabold text-navy">Pago en revisión</h1>
        <p className="text-muted">
          Hemos recibido tu comprobante. Nuestro equipo lo revisará en breve y activará tu cuenta.
        </p>
        <BigButton onClick={() => router.replace("/app")} className="mt-4">
          Entendido
        </BigButton>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header>
        <button onClick={() => router.back()} className="font-bold text-navy text-lg">
          ← Atrás
        </button>
        <h1 className="mt-2 text-2xl font-extrabold text-navy">Activar Press 🚀</h1>
        <p className="text-muted">Crea presupuestos ilimitados y guárdalos para siempre.</p>
      </header>

      <section className="rounded-2xl border-2 border-navy bg-navy/5 p-5 text-center">
        <p className="text-sm font-bold uppercase text-navy">Plan Profesional</p>
        <p className="mt-1 text-5xl font-extrabold text-navy">${PRICE_USD} <span className="text-xl">/mes</span></p>
        <p className="mt-2 text-sm text-slate-600">Pagas en USDT o USDC vía Binance</p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">1. Envía el pago por Binance</h2>
          <p className="text-sm text-muted mt-1">Abre tu app de Binance, ve a Pay y envía {PRICE_USD} USDT al siguiente ID:</p>
          
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs text-muted uppercase">Binance Pay ID</p>
              <p className="text-lg font-bold tracking-wider">{binanceId}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-navy shadow-sm transition active:scale-95"
            >
              {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">2. Sube la captura de pantalla</h2>
          <p className="text-sm text-muted mt-1">Sube la imagen del pago completado (donde se vea el ID de la transacción).</p>
          
          <label className="mt-4 flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
            {file ? (
              <>
                <CheckCircle className="text-green-500" size={32} />
                <span className="font-bold text-green-700">{file.name}</span>
                <span className="text-xs text-muted">Toca para cambiar imagen</span>
              </>
            ) : (
              <>
                <Upload className="text-navy" size={32} />
                <span className="font-bold text-navy">Seleccionar imagen</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <BigButton
          onClick={handleSubmit}
          disabled={!file || saving}
          className="mt-2"
        >
          {saving ? "Enviando..." : "Enviar comprobante"}
        </BigButton>
      </section>
    </main>
  );
}
