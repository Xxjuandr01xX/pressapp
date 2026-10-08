import type { QuoteStatus } from "@/types";

const map: Record<QuoteStatus, { label: string; cls: string }> = {
  borrador: { label: "Borrador", cls: "bg-slate-200 text-slate-800" },
  enviado: { label: "Enviado", cls: "bg-amber-100 text-amber-900" },
  aprobado: { label: "Aprobado", cls: "bg-green-100 text-green-900" },
  rechazado: { label: "Rechazado", cls: "bg-red-100 text-red-900" },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const s = map[status];
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${s.cls}`}>{s.label}</span>;
}

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-lg text-muted">{text}</p>
    </div>
  );
}
