"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../../layout";
import { BigButton } from "@/components/ui/BigButton";
import { StatusBadge } from "@/components/ui/Status";
import { getQuote, updateQuote } from "@/lib/firebase/store";
import { calcTotals, formatUSD, formatBs, DEFAULT_TAX_RATE, toWhatsAppNumber } from "@/lib/quote";
import { TRADES } from "@/lib/templates";
import { QuotePDF } from "@/lib/pdf/QuotePDF";
import { pdf } from "@react-pdf/renderer";
import type { Quote } from "@/types";
import { Download, Send, CheckCircle, XCircle } from "lucide-react";

export default function QuoteDetailPage() {
  const { user } = useAuth();
  const { business } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user || !quoteId) return;
    getQuote(user.uid, business.id, quoteId).then((q) => {
      setQuote(q);
      setLoading(false);
    });
  }, [user, business.id, quoteId]);

  const tradeMeta = TRADES.find((t) => t.id === business.trade);
  const totals = quote ? calcTotals(quote.items, quote.taxRate || DEFAULT_TAX_RATE, quote.exchangeRate) : null;

  const date = quote?.createdAt instanceof Date
    ? quote.createdAt
    : quote?.createdAt?.toDate?.() ?? new Date();

  const formattedDate = new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  async function generateAndDownload() {
    if (!quote || !totals) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <QuotePDF
          quoteNumber={quote.quoteNumber}
          businessName={business.businessName}
          businessPhone={business.phone}
          tradeName={tradeMeta?.label || "Servicios"}
          clientName={quote.clientName}
          clientPhone={quote.clientPhone}
          items={quote.items}
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
          totalBs={totals.totalBs}
          taxRate={quote.taxRate || DEFAULT_TAX_RATE}
          notes={quote.notes}
          date={formattedDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Press_${quote.quoteNumber}_${quote.clientName.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error generando PDF:", e);
    }
    setGenerating(false);
  }

  async function shareWhatsApp() {
    if (!quote || !totals) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <QuotePDF
          quoteNumber={quote.quoteNumber}
          businessName={business.businessName}
          businessPhone={business.phone}
          tradeName={tradeMeta?.label || "Servicios"}
          clientName={quote.clientName}
          clientPhone={quote.clientPhone}
          items={quote.items}
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
          totalBs={totals.totalBs}
          taxRate={quote.taxRate || DEFAULT_TAX_RATE}
          notes={quote.notes}
          date={formattedDate}
        />
      ).toBlob();

      const file = new File([blob], `Presupuesto_${quote.quoteNumber}.pdf`, { type: "application/pdf" });

      // Mensaje de texto base
      const msg = encodeURIComponent(
        `Hola ${quote.clientName}! 👋\n\nTe envío tu presupuesto de *${business.businessName}*.\n\n📋 Presupuesto #${quote.quoteNumber}\n💵 Total: *${formatUSD(totals.total)}*\n\nTe adjunto el PDF. ¡Quedo atento!\n\n_Generado con Press_`
      );
      
      const waNumber = quote.clientPhone ? toWhatsAppNumber(quote.clientPhone) : "";
      const waLink = waNumber ? `https://wa.me/${waNumber}?text=${msg}` : `https://wa.me/?text=${msg}`;

      // En móviles con soporte real de compartir archivos (Android/iOS)
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `Presupuesto ${quote.quoteNumber}`,
          text: `Presupuesto de ${business.businessName} para ${quote.clientName} — ${formatUSD(totals.total)}`,
          files: [file],
        });
      } else {
        // En PC o navegadores sin soporte: Descargamos el PDF y abrimos WhatsApp Web
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Presupuesto_${quote.quoteNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        // Abrir WhatsApp Web/App
        // Usamos location.href si window.open es bloqueado por el navegador
        const newWindow = window.open(waLink, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          window.location.href = waLink;
        }
      }

      // Marcar como enviado
      if (quote.status === "borrador" && user) {
        await updateQuote(user.uid, business.id, quoteId, {
          status: "enviado",
          sentAt: new Date(),
        });
        setQuote({ ...quote, status: "enviado" });
      }
    } catch (e) {
      console.error("Error al compartir:", e);
    }
    setGenerating(false);
  }

  async function changeStatus(newStatus: "aprobado" | "rechazado") {
    if (!quote || !user) return;
    await updateQuote(user.uid, business.id, quoteId, { status: newStatus });
    setQuote({ ...quote, status: newStatus });
  }

  // ─── Loading / Error ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!quote || !totals) {
    return (
      <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-5">
        <span className="text-4xl">😕</span>
        <p className="text-lg font-bold">Presupuesto no encontrado</p>
        <BigButton onClick={() => router.replace("/app")}>Volver al inicio</BigButton>
      </main>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <main className="flex flex-col gap-5 px-5 py-6">
      {/* Header */}
      <header>
        <button onClick={() => router.back()} className="text-navy font-bold text-lg">
          ← Atrás
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold">#{quote.quoteNumber}</h1>
            <p className="text-sm text-muted">{formattedDate}</p>
          </div>
          <StatusBadge status={quote.status} />
        </div>
      </header>

      {/* Cliente */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase text-muted">Cliente</p>
        <p className="text-lg font-bold mt-1">{quote.clientName}</p>
        {quote.clientPhone && (
          <p className="text-muted text-sm mt-1">📱 {quote.clientPhone}</p>
        )}
      </section>

      {/* Items */}
      <section className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="bg-navy px-4 py-3">
          <p className="text-xs font-bold uppercase text-white tracking-wide">Detalle</p>
        </div>
        {quote.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              i % 2 === 1 ? "bg-slate-50" : ""
            } ${i < quote.items.length - 1 ? "border-b border-slate-100" : ""}`}
          >
            <div className="flex-1">
              <p className="font-semibold">{item.description || "—"}</p>
              <p className="text-xs text-muted">
                {item.quantity} {item.unit} × {formatUSD(item.unitPriceUSD)}
              </p>
            </div>
            <span className="font-bold">
              {formatUSD(item.quantity * item.unitPriceUSD)}
            </span>
          </div>
        ))}
      </section>

      {/* Totales */}
      <section className="rounded-2xl bg-navy p-5 text-white">
        <div className="flex justify-between text-base">
          <span>Subtotal</span>
          <span>{formatUSD(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>IVA ({Math.round((quote.taxRate || DEFAULT_TAX_RATE) * 100)}%)</span>
          <span>{formatUSD(totals.tax)}</span>
        </div>
        <hr className="my-2 border-white/20" />
        <div className="flex justify-between text-xl font-extrabold">
          <span>TOTAL</span>
          <span>{formatUSD(totals.total)}</span>
        </div>
        {totals.totalBs && (
          <div className="flex justify-between text-sm mt-1 opacity-70">
            <span>Ref. Bolívares</span>
            <span>{formatBs(totals.totalBs)}</span>
          </div>
        )}
      </section>

      {/* Notas */}
      {quote.notes && (
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase text-muted mb-1">Notas</p>
          <p className="text-sm">{quote.notes}</p>
        </section>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 pt-2 pb-4">
        <BigButton
          variant="whatsapp"
          icon={<Send size={20} />}
          onClick={shareWhatsApp}
          disabled={generating}
        >
          {generating ? "Generando PDF..." : "📤 Mandar por WhatsApp"}
        </BigButton>

        <BigButton
          variant="primary"
          icon={<Download size={20} />}
          onClick={generateAndDownload}
          disabled={generating}
        >
          {generating ? "Generando..." : "📥 Descargar PDF"}
        </BigButton>

        {/* Botones de estado (solo si ya fue enviado) */}
        {quote.status === "enviado" && (
          <div className="flex gap-3">
            <button
              onClick={() => changeStatus("aprobado")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-green-200 bg-green-50 py-3 font-bold text-green-700 active:bg-green-100"
            >
              <CheckCircle size={18} /> Aprobado
            </button>
            <button
              onClick={() => changeStatus("rechazado")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 py-3 font-bold text-red-600 active:bg-red-100"
            >
              <XCircle size={18} /> Rechazado
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
