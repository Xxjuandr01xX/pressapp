import { NextResponse } from "next/server";
import { notifyPaymentReceipt } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, email, amount, currency, image } = body;
    
    await notifyPaymentReceipt({
      paymentId,
      email,
      amount,
      currency,
      image
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to notify" }, { status: 500 });
  }
}
