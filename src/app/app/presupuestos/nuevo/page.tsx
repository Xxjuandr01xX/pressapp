"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "../../layout";
import { SYSTEM_TEMPLATES, templatesFor, TRADES } from "@/lib/templates";
import { FileText } from "lucide-react";

export default function NuevoPresupuestoPage() {
  const { business } = useAppContext();
  const router = useRouter();

  const myTemplates = templatesFor(business.trade);
  const tradeMeta = TRADES.find((t) => t.id === business.trade);

  function selectTemplate(templateId: string) {
    router.push(`/app/presupuestos/crear?template=${templateId}`);
  }

  function startBlank() {
    router.push(`/app/presupuestos/crear`);
  }

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header>
        <button onClick={() => router.back()} className="text-navy font-bold text-lg">
          ← Atrás
        </button>
        <h1 className="text-2xl font-extrabold mt-2">¿Qué trabajo es? 🔨</h1>
        <p className="text-muted">Elige una plantilla o empieza en blanco.</p>
      </header>

      {/* Plantillas para su oficio */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase text-muted">
          {tradeMeta?.emoji} {tradeMeta?.label}
        </h2>
        {myTemplates
          .filter((t) => t.trade === business.trade)
          .map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => selectTemplate(tpl.id)}
              className="flex min-h-14 items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white px-5 text-lg font-bold transition active:scale-[0.98] active:bg-slate-50"
            >
              <span className="text-2xl">{tpl.emoji}</span>
              <div className="flex flex-col items-start">
                <span>{tpl.name}</span>
                <span className="text-sm font-normal text-muted">
                  {tpl.items.length} items · toca para ajustar precios
                </span>
              </div>
            </button>
          ))}
      </section>

      {/* Plantilla genérica */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase text-muted">🛠️ General</h2>
        {myTemplates
          .filter((t) => t.trade === "general")
          .map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => selectTemplate(tpl.id)}
              className="flex min-h-14 items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white px-5 text-lg font-bold transition active:scale-[0.98] active:bg-slate-50"
            >
              <span className="text-2xl">{tpl.emoji}</span>
              <span>{tpl.name}</span>
            </button>
          ))}

        <button
          onClick={startBlank}
          className="flex min-h-14 items-center gap-4 rounded-2xl border-2 border-dashed border-navy/30 bg-white px-5 text-lg font-bold text-navy transition active:scale-[0.98] active:bg-slate-50"
        >
          <FileText className="text-navy" size={24} />
          <span>✏️ Empezar en blanco</span>
        </button>
      </section>
    </main>
  );
}
