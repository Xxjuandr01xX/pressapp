import { NextResponse } from "next/server";
import { answerCallback, sendText } from "@/lib/telegram";
import { approvePayment, rejectPayment } from "@/lib/subscription-store";

/** Recibe los clicks de los botones inline (Aprobar / Rechazar) en Telegram. */
export async function POST(req: Request) {
  // Verificar token de seguridad de Telegram
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.callback_query) return NextResponse.json({ ok: true });

    const cb = body.callback_query;
    const data = cb.data as string; // ej: "approve:pay_123" o "reject:pay_123"
    const [action, paymentId] = data.split(":");
    const reviewer = cb.from.username ?? cb.from.first_name;

    if (action === "approve") {
      const res = await approvePayment(paymentId, reviewer);
      const txt = res.already
        ? `⚠️ Pago de ${res.email} ya estaba aprobado.`
        : `✅ Aprobado por ${reviewer}. Suscripción de ${res.email} activa hasta ${res.until?.toLocaleDateString("es-VE")}.`;
      await answerCallback(cb.id, "Aprobado");
      await sendText(txt);
    } else if (action === "reject") {
      const ok = await rejectPayment(paymentId, reviewer);
      const txt = ok ? `❌ Pago ${paymentId} rechazado por ${reviewer}.` : "⚠️ No se pudo rechazar o ya estaba procesado.";
      await answerCallback(cb.id, "Rechazado");
      await sendText(txt);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true }); // Telegram reintenta si no devuelves 200, evita loops
  }
}
