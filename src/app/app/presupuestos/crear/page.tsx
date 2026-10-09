"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../../layout";
import { BigButton } from "@/components/ui/BigButton";
import { SYSTEM_TEMPLATES } from "@/lib/templates";
import { calcTotals, formatUSD, formatBs, DEFAULT_TAX_RATE } from "@/lib/quote";
import { createQuote } from "@/lib/firebase/store";
import type { QuoteItem } from "@/types";
import { Minus, Plus, Trash2, Send } from "lucide-react";

function generateQuoteNumber(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `P-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export default function CrearPresupuestoPage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar plantilla si viene con template
  useEffect(() => {
    if (templateId) {
      const tpl = SYSTEM_TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        setItems(tpl.items.map((i) => ({ ...i })));
      }
    }
  }, [templateId]);

  const totals = calcTotals(items, DEFAULT_TAX_RATE);

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addBlankItem() {
    setItems((prev) => [
      ...prev,
      { description: "", category: "material", quantity: 1, unit: "und", unitPriceUSD: 0 },
    ]);
  }

  async function handleSave(sendNow: boolean) {
    if (!user || items.length === 0) return;
    setSaving(true);
    try {
      const quoteData: any = {
        quoteNumber: generateQuoteNumber(),
        clientName: clientName.trim() || "Sin nombre",
        status: sendNow ? "enviado" : "borrador",
        items,
        taxRate: DEFAULT_TAX_RATE,
      };

      if (clientPhone.trim()) quoteData.clientPhone = clientPhone.trim();
      if (notes.trim()) quoteData.notes = notes.trim();
      if (sendNow) quoteData.sentAt = new Date();

      const quoteId = await createQuote(user.uid, business.id, quoteData);

      setSaved(true);
      // Redirigir al detalle donde puede descargar PDF y compartir por WhatsApp
      setTimeout(() => router.replace(`/app/presupuestos/${quoteId}`), 1200);
    } catch (e) {
      console.error("Error al guardar presupuesto:", e);
      setSaving(false);
    }
  }

  // Pantalla de éxito
  if (saved) {
    return (
      <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-5">
        <span className="text-6xl">✅</span>
        <h1 className="text-2xl font-extrabold text-center">
          ¡Presupuesto guardado!
        </h1>
        <p className="text-muted text-center">Volviendo al inicio...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 px-5 py-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-navy font-bold text-lg">
          ← Atrás
        </button>
        <span className="text-sm text-muted">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </header>

      <h1 className="text-xl font-extrabold">Arma tu presupuesto 📋</h1>

      {/* Cliente */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase text-muted">Cliente</h2>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nombre del cliente (ej: Sra. María)"
          className="mb-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-navy"
        />
        <input
          type="tel"
          inputMode="numeric"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          placeholder="WhatsApp del cliente (ej: 0414-1234567)"
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-navy"
        />
      </section>

      {/* Items */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase text-muted">Items del presupuesto</h2>

        {items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
            <p className="font-bold">No hay items todavía</p>
            <p className="text-sm text-muted mt-1">Toca &ldquo;+ Agregar algo más&rdquo; abajo</p>
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-white p-4 shadow-sm">
            {/* Descripción */}
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(idx, { description: e.target.value })}
              placeholder="¿Qué es? (ej: Tubo PVC 1/2)"
              className="mb-2 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-base outline-none focus:border-navy"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Cantidad con +/- */}
              <div className="flex items-center gap-1 rounded-xl border-2 border-slate-200 px-1">
                <button
                  onClick={() => updateItem(idx, { quantity: Math.max(0.5, item.quantity - 1) })}
                  className="flex h-10 w-10 items-center justify-center text-navy"
                  aria-label="Menos"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, { quantity: Math.max(0, Number(e.target.value)) })}
                  className="w-12 text-center text-base font-bold outline-none"
                />
                <button
                  onClick={() => updateItem(idx, { quantity: item.quantity + 1 })}
                  className="flex h-10 w-10 items-center justify-center text-navy"
                  aria-label="Más"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Unidad */}
              <select
                value={item.unit}
                onChange={(e) => updateItem(idx, { unit: e.target.value })}
                className="rounded-xl border-2 border-slate-200 px-2 py-2 text-sm outline-none"
              >
                <option value="und">und</option>
                <option value="m">m</option>
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="h">h</option>
                <option value="saco">saco</option>
                <option value="galón">galón</option>
                <option value="litro">litro</option>
                <option value="bolsa">bolsa</option>
                <option value="punto">punto</option>
                <option value="trabajo">trabajo</option>
                <option value="equipo">equipo</option>
                <option value="visita">visita</option>
              </select>

              {/* Precio */}
              <div className="flex min-w-[100px] flex-1 items-center rounded-xl border-2 border-slate-200 px-2">
                <span className="text-muted text-sm">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={item.unitPriceUSD}
                  onChange={(e) => updateItem(idx, { unitPriceUSD: Math.max(0, Number(e.target.value)) })}
                  className="w-full py-2 pl-1 text-right text-base font-bold outline-none"
                />
              </div>

              {/* Eliminar */}
              <button
                onClick={() => removeItem(idx)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-400 active:bg-red-50"
                aria-label="Eliminar item"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Subtotal de línea */}
            <p className="mt-2 text-right text-sm font-semibold text-muted">
              Subtotal: {formatUSD(item.quantity * item.unitPriceUSD)}
            </p>
          </div>
        ))}

        <button
          onClick={addBlankItem}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/30 text-navy font-bold active:bg-slate-50"
        >
          <Plus size={18} /> Agregar algo más
        </button>
      </section>

      {/* Notas */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold uppercase text-muted">Notas (opcional)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Garantía de 30 días, materiales no incluyen transporte..."
          rows={2}
          className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-base outline-none focus:border-navy resize-none"
        />
      </section>

      {/* Totales */}
      {items.length > 0 && (
        <section className="rounded-2xl bg-navy p-5 text-white">
          <div className="flex justify-between text-base">
            <span>Subtotal</span>
            <span>{formatUSD(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span>IVA (16%)</span>
            <span>{formatUSD(totals.tax)}</span>
          </div>
          <hr className="my-2 border-white/20" />
          <div className="flex justify-between text-xl font-extrabold">
            <span>TOTAL</span>
            <span>{formatUSD(totals.total)}</span>
          </div>
        </section>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 pb-4">
        <BigButton
          variant="whatsapp"
          icon={<Send size={20} />}
          disabled={saving || items.length === 0}
          onClick={() => handleSave(true)}
        >
          {saving ? "Guardando..." : "Mandar por WhatsApp"}
        </BigButton>
        <BigButton
          variant="ghost"
          disabled={saving || items.length === 0}
          onClick={() => handleSave(false)}
        >
          💾 Guardar como borrador
        </BigButton>
      </div>
    </main>
  );
}
