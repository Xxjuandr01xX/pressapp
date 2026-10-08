import { NextResponse } from "next/server";
import { answerCallback, sendText } from "@/lib/telegram";
import { approvePayment, rejectPayment } from "@/lib/subscription-store";

export async function POST(req: Request) {
  let cbId = "";
  try {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      await sendText(`⚠️ Error de Webhook: El Secret Token no coincide. Revisa la variable TELEGRAM_WEBHOOK_SECRET en Netlify.`);
      return NextResponse.json({ ok: true }); // Siempre 200 para destrabar el botón
    }

    const body = await req.json();
    if (!body.callback_query) return NextResponse.json({ ok: true });

    const cb = body.callback_query;
    cbId = cb.id;
    const data = cb.data as string;
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
  } catch (e: any) {
    console.error(e);
    if (cbId) await answerCallback(cbId, "Error interno");
    await sendText(`❌ Error interno del servidor al procesar el botón:\n<code>${e.message || String(e)}</code>`);
    return NextResponse.json({ ok: true });
  }
}
