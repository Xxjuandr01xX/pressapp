import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/server-auth";
import { canWrite, daysLeft } from "@/lib/subscription";
import { ensureSubscription, getSubscription } from "@/lib/subscription-store";
import { notifyNewUser } from "@/lib/telegram";

/** POST: crea el trial de 15 días la primera vez. GET: estado actual. */
export async function POST(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { created } = await ensureSubscription(user.uid, user.email ?? "");
  if (created) await notifyNewUser(user.email ?? user.uid);
  return GET(req);
}

export async function GET(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sub = await getSubscription(user.uid);
  if (!sub) return NextResponse.json({ status: "none" });
  return NextResponse.json({
    status: sub.status,
    canWrite: canWrite(sub.status),
    daysLeft: daysLeft(sub),
    currentPeriodEnd: sub.currentPeriodEnd ?? null,
    trialExpiresAt: sub.trialExpiresAt,
  });
}
