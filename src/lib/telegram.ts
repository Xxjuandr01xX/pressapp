import "server-only";

const api = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

async function call(method: string, body: Record<string, unknown>) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(api(method), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, parse_mode: "HTML", ...body }),
    });
  } catch (e) {
    // Una falla de Telegram nunca debe romper el flujo del usuario
    console.error("Telegram error", e);
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function notifyNewUser(email: string) {
  return call("sendMessage", { text: `🆕 Nuevo registro (trial 15 días): <b>${esc(email)}</b>` });
}

export async function notifyPaymentReceipt(p: { paymentId: string; email: string; amount: number; currency: string; image: string }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  
  try {
    // 1. Extraer el base64 real
    const base64Data = p.image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // 2. Preparar el formulario
    const formData = new FormData();
    formData.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    formData.append("photo", blob, "receipt.jpg");
    formData.append("parse_mode", "HTML");
    formData.append("caption", `💰 <b>Comprobante recibido</b>\nUsuario: ${esc(p.email)}\nMonto: ${p.amount} ${p.currency}\nID: <code>${p.paymentId}</code>\n\nVerifica en tu Binance antes de aprobar.`);
    formData.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅ Aprobar", callback_data: `approve:${p.paymentId}` },
          { text: "❌ Rechazar", callback_data: `reject:${p.paymentId}` },
        ],
      ],
    }));

    // 3. Enviar a Telegram
    await fetch(api("sendPhoto"), {
      method: "POST",
      body: formData,
    });
  } catch (e) {
    console.error("Error enviando comprobante a telegram", e);
  }
}

export function sendText(text: string) {
  return call("sendMessage", { text });
}

export async function answerCallback(callbackQueryId: string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  await fetch(api("answerCallbackQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}
